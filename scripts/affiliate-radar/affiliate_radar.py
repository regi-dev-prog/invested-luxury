"""
affiliate_radar.py — Weekly Affiliate Opportunity Radar for InvestedLuxury.

What it does (read-only — never mutates Sanity, never submits applications):

  STEP 1 — SCAN: Pull every article + product from Sanity. Extract:
    - External retailer domains from article body links (markDefs)
    - Retailer domains from product affiliateLinks
    - Count mentions per domain (weighted: product link = 3, body link = 1)

  STEP 2 — MATCH: Cross-reference against known_programs.json:
    - Skip domains already covered by approved programs
    - Flag domains matching pending programs (waiting on approval)
    - Match remaining domains to known program entries
    - Surface unknown domains with high mention counts for manual research

  STEP 3 — RANK: Score every actionable program:
      score = site_mentions × est_commission_per_sale × confidence
    where confidence reflects data quality (1.0 known program, 0.5 estimated).
    Apply the $50 minimum commission-per-sale threshold (standing rule).

  STEP 4 — REPORT: Write REPORT.md with the top opportunities, each with:
    - The economics (commission %, AOV, cookie window, est $/sale)
    - Where it's mentioned on the site (which articles)
    - A personalized outreach/application draft ready to copy-paste

Application submission is INTENTIONALLY manual — luxury affiliate managers
review applications by hand, agreements carry legal terms, and automated
applications risk the publisher account. The radar prepares everything;
Regi clicks submit.

Env: SANITY_TOKEN (read access is enough).
CLI: --output-dir DIR (default '.')
"""

import argparse
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import date

SANITY_PROJECT = "4b3ap7pf"
SANITY_DATASET = "production"
SANITY_QUERY_URL = (
    f"https://{SANITY_PROJECT}.api.sanity.io/v2024-01-01"
    f"/data/query/{SANITY_DATASET}"
)

MIN_COMMISSION_PER_SALE = 50  # standing rule: $50 minimum
PRODUCT_LINK_WEIGHT = 3       # a product affiliateLink mention is worth 3 body links
BODY_LINK_WEIGHT = 1

# Domains that are never affiliate opportunities (own site, socials, references)
IGNORE_DOMAINS = {
    "investedluxury.com", "instagram.com", "pinterest.com", "facebook.com",
    "twitter.com", "x.com", "youtube.com", "tiktok.com", "linkedin.com",
    "google.com", "wikipedia.org", "anrdoezrs.net", "tkqlhce.com",
    "dpbolvw.net", "jdoqocy.com", "kqzyfj.com", "awin1.com", "prf.hn",
    "linksynergy.com", "rakuten.com", "cj.com", "vogue.com", "wwd.com",
    "businessoffashion.com", "nytimes.com", "forbes.com", "gq.com",
    "harpersbazaar.com", "elle.com", "whowhatwear.com", "archive.org",
}


def log(msg: str) -> None:
    print(f"[radar] {msg}", flush=True)


def sanity_query(groq: str):
    token = os.environ.get("SANITY_TOKEN")
    if not token:
        raise RuntimeError("SANITY_TOKEN env var required")
    qs = urllib.parse.urlencode({"query": groq})
    req = urllib.request.Request(
        f"{SANITY_QUERY_URL}?{qs}",
        headers={"Authorization": f"Bearer {token}"},
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read())["result"]


def root_domain(url: str) -> str | None:
    """Extract registrable domain from a URL: 'https://www.x.co.uk/p' -> 'x.co.uk'-ish.
    Simple two-label heuristic; good enough for retailer domains."""
    try:
        netloc = urllib.parse.urlparse(url).netloc.lower()
    except Exception:
        return None
    if not netloc:
        return None
    netloc = netloc.split(":")[0]
    if netloc.startswith("www."):
        netloc = netloc[4:]
    parts = netloc.split(".")
    if len(parts) >= 3 and parts[-2] in {"co", "com", "net", "org"} and len(parts[-1]) == 2:
        return ".".join(parts[-3:])  # e.g. matchesfashion.co.uk
    if len(parts) >= 2:
        return ".".join(parts[-2:])
    return netloc


# ---------------------------------------------------------------------------
# STEP 1 — Scan Sanity
# ---------------------------------------------------------------------------

ARTICLES_GROQ = """
*[_type == "article" && defined(slug.current)] {
  "slug": slug.current,
  title,
  "hrefs": body[].markDefs[defined(href)].href
}
"""

PRODUCTS_GROQ = """
*[_type == "product"] {
  _id,
  name,
  "links": affiliateLinks[defined(url) && url != ""].url
}
"""


def unwrap_cj(url: str) -> str:
    """If the URL is a CJ deep link, extract the underlying target."""
    if "url=" in url and any(d in url for d in
                             ("anrdoezrs", "tkqlhce", "dpbolvw", "jdoqocy", "kqzyfj")):
        try:
            target = url.split("url=", 1)[1]
            return urllib.parse.unquote(target)
        except Exception:
            return url
    return url


def scan_site():
    """Returns: domain -> {'weight': float, 'articles': set, 'products': set}"""
    mentions: dict[str, dict] = defaultdict(
        lambda: {"weight": 0.0, "articles": set(), "products": set()}
    )

    articles = sanity_query(ARTICLES_GROQ) or []
    log(f"Scanned {len(articles)} articles")
    for a in articles:
        for href in (a.get("hrefs") or []):
            if not href or not isinstance(href, str):
                continue
            dom = root_domain(unwrap_cj(href))
            if not dom or dom in IGNORE_DOMAINS:
                continue
            mentions[dom]["weight"] += BODY_LINK_WEIGHT
            mentions[dom]["articles"].add(a.get("slug") or "?")

    products = sanity_query(PRODUCTS_GROQ) or []
    log(f"Scanned {len(products)} products")
    for p in products:
        for url in (p.get("links") or []):
            dom = root_domain(unwrap_cj(url))
            if not dom or dom in IGNORE_DOMAINS:
                continue
            mentions[dom]["weight"] += PRODUCT_LINK_WEIGHT
            mentions[dom]["products"].add(p.get("name") or p.get("_id") or "?")

    return mentions


# ---------------------------------------------------------------------------
# STEP 2+3 — Match against known programs and rank
# ---------------------------------------------------------------------------

def load_programs(path: str) -> dict:
    with open(path) as f:
        return json.load(f)


def build_domain_index(programs_doc: dict):
    approved = {}
    pending = {}
    known = {}
    for entry in programs_doc.get("approved", []):
        for d in entry.get("domains", []):
            approved[d] = entry
    for entry in programs_doc.get("pending", []):
        for d in entry.get("domains", []):
            pending[d] = entry
    for entry in programs_doc.get("programs", []):
        for d in entry.get("domains", []):
            known[d] = entry
    return approved, pending, known


def rank_opportunities(mentions: dict, programs_doc: dict):
    approved_idx, pending_idx, known_idx = build_domain_index(programs_doc)

    opportunities = []   # actionable: known program, not approved/pending
    pending_hits = []    # mentioned + already pending — affirms priority
    unknown = []         # mentioned, no program data — manual research list

    for dom, info in mentions.items():
        if dom in approved_idx:
            continue  # already monetized
        if dom in pending_idx:
            pending_hits.append({
                "domain": dom,
                "program": pending_idx[dom]["name"],
                "network": pending_idx[dom]["network"],
                "weight": info["weight"],
                "articles": sorted(info["articles"]),
                "products": sorted(info["products"]),
            })
            continue
        if dom in known_idx:
            prog = known_idx[dom]
            cps = prog.get("est_commission_per_sale_usd") or 0
            if cps <= 0:
                continue  # non-programs (e.g. Virtuoso)
            meets_threshold = cps >= MIN_COMMISSION_PER_SALE
            confidence = 1.0
            score = info["weight"] * cps * confidence
            opportunities.append({
                "domain": dom,
                "program": prog["name"],
                "network": prog["network"],
                "vertical": prog.get("vertical", "?"),
                "commission_pct": prog.get("est_commission_pct"),
                "aov": prog.get("est_aov_usd"),
                "commission_per_sale": cps,
                "cookie_days": prog.get("cookie_days"),
                "notes": prog.get("notes", ""),
                "weight": info["weight"],
                "articles": sorted(info["articles"]),
                "products": sorted(info["products"]),
                "meets_threshold": meets_threshold,
                "score": round(score, 1),
            })
        else:
            if info["weight"] >= 2:  # only surface domains with real presence
                unknown.append({
                    "domain": dom,
                    "weight": info["weight"],
                    "articles": sorted(info["articles"])[:5],
                    "products": sorted(info["products"])[:5],
                })

    opportunities.sort(key=lambda x: (x["meets_threshold"], x["score"]), reverse=True)
    pending_hits.sort(key=lambda x: x["weight"], reverse=True)
    unknown.sort(key=lambda x: x["weight"], reverse=True)
    return opportunities, pending_hits, unknown


# ---------------------------------------------------------------------------
# STEP 4 — Report + outreach drafts
# ---------------------------------------------------------------------------

OUTREACH_TEMPLATE = """\
Subject: Publisher application — InvestedLuxury.com ({vertical} editorial)

Hi {program} affiliate team,

I run InvestedLuxury.com, an independent editorial site analyzing luxury
purchases through cost-per-wear, resale value, and 10-year cost of
ownership. Our readers are affluent (HHI $150K+, ages 28-55) across the
US, UK, UAE, Singapore, and Hong Kong — researching exactly the
considered, high-AOV purchases {program} specializes in.

{program} is already referenced organically in {n_articles} of our
published articles{article_example}, so approval would let us convert
existing editorial mentions into tracked partnerships rather than starting
from zero.

Site: https://investedluxury.com
Methodology: https://investedluxury.com/methodology
Current partners include Farfetch, Mytheresa, and Booking.com.

Happy to share traffic data or answer any questions.

Best,
Regi
InvestedLuxury Editorial
hello@investedluxury.com
"""


def outreach_for(opp: dict) -> str:
    n = len(opp["articles"])
    example = ""
    if opp["articles"]:
        example = f" (e.g. investedluxury.com/.../{opp['articles'][0]})"
    return OUTREACH_TEMPLATE.format(
        program=opp["program"],
        vertical=opp.get("vertical", "luxury"),
        n_articles=n if n else "several",
        article_example=example,
    )


def write_report(path: str, opportunities, pending_hits, unknown):
    lines = []
    lines.append(f"# Affiliate Opportunity Radar — {date.today().isoformat()}")
    lines.append("")
    lines.append("_Read-only weekly scan. Applications remain manual by design._")
    lines.append("")

    actionable = [o for o in opportunities if o["meets_threshold"]]
    below = [o for o in opportunities if not o["meets_threshold"]]

    lines.append(f"## Top opportunities ({len(actionable)} meet the $50/sale threshold)")
    lines.append("")
    for i, o in enumerate(actionable, 1):
        lines.append(f"### {i}. {o['program']}  —  score {o['score']}")
        lines.append("")
        lines.append(f"- **Network:** {o['network']}  |  **Vertical:** {o['vertical']}")
        lines.append(f"- **Economics:** ~{o['commission_pct']}% commission, ~${o['aov']} AOV "
                     f"→ **~${o['commission_per_sale']}/sale**, {o['cookie_days']}-day cookie")
        lines.append(f"- **Site presence:** weight {o['weight']} "
                     f"({len(o['articles'])} articles, {len(o['products'])} products)")
        if o["articles"]:
            lines.append(f"- **Articles:** {', '.join(o['articles'][:6])}"
                         + (" …" if len(o["articles"]) > 6 else ""))
        if o["products"]:
            lines.append(f"- **Products:** {', '.join(o['products'][:6])}"
                         + (" …" if len(o["products"]) > 6 else ""))
        if o["notes"]:
            lines.append(f"- **Notes:** {o['notes']}")
        lines.append("")
        lines.append("<details><summary>Outreach draft (copy-paste)</summary>")
        lines.append("")
        lines.append("```text")
        lines.append(outreach_for(o))
        lines.append("```")
        lines.append("</details>")
        lines.append("")

    if pending_hits:
        lines.append("## Already pending — site presence confirms priority")
        lines.append("")
        for p in pending_hits:
            lines.append(f"- **{p['program']}** ({p['network']}) — weight {p['weight']}, "
                         f"{len(p['articles'])} articles, {len(p['products'])} products. "
                         f"Chase the approval; inventory is already waiting.")
        lines.append("")

    if below:
        lines.append("## Known programs below the $50/sale threshold (skip)")
        lines.append("")
        for o in below:
            lines.append(f"- {o['program']}: ~${o['commission_per_sale']}/sale "
                         f"(weight {o['weight']}) — {o['notes'][:80]}")
        lines.append("")

    if unknown:
        lines.append("## Unknown domains worth researching (no program data yet)")
        lines.append("")
        lines.append("These appear on the site but aren't in known_programs.json. "
                     "Research whether they run a program on AWIN/CJ/Rakuten/Partnerize, "
                     "then add an entry to known_programs.json.")
        lines.append("")
        for u in unknown[:20]:
            ctx = u["articles"] or u["products"]
            lines.append(f"- **{u['domain']}** — weight {u['weight']} "
                         f"(e.g. {', '.join(ctx[:3])})")
        lines.append("")

    with open(path, "w") as f:
        f.write("\n".join(lines))
    log(f"Wrote {path}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", default=".")
    parser.add_argument("--programs-file", default="known_programs.json")
    args = parser.parse_args()

    log("STEP 1 — Scanning site…")
    mentions = scan_site()
    log(f"Found {len(mentions)} distinct external retailer domains")

    log("STEP 2+3 — Matching and ranking…")
    programs_doc = load_programs(args.programs_file)
    opportunities, pending_hits, unknown = rank_opportunities(mentions, programs_doc)
    log(f"  {len(opportunities)} known-program opportunities "
        f"({sum(1 for o in opportunities if o['meets_threshold'])} above threshold)")
    log(f"  {len(pending_hits)} pending programs with confirmed site presence")
    log(f"  {len(unknown)} unknown domains for manual research")

    log("STEP 4 — Writing report…")
    os.makedirs(args.output_dir, exist_ok=True)
    write_report(os.path.join(args.output_dir, "REPORT.md"),
                 opportunities, pending_hits, unknown)
    with open(os.path.join(args.output_dir, "radar_data.json"), "w") as f:
        json.dump({
            "opportunities": opportunities,
            "pending_hits": pending_hits,
            "unknown": unknown,
        }, f, indent=2, default=list)
    log("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
