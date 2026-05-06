"""
Debug-only: verify CJ Product Search API connectivity with the CORRECT schema.

Key insight from previous run:
  - CID (Company ID, publisher account)  = 7910614
  - PID (Property ID, website tracker)   = 101713247
  We pass CID to companyId, NOT PID.
  - Mytheresa products live under the `shoppingProducts` query.
"""
import os, json, urllib.request, urllib.error

CJ_PAT = os.environ["CJ_PAT"]
CID = "7910614"  # publisher company account (was wrongly 101713247 last run)
ENDPOINT = "https://ads.api.cj.com/query"

MYTHERESA = {
    "us":   "2817689",
    "uk":   "2816786",
    "intl": "4189905",
}

def call(query_str: str) -> dict:
    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps({"query": query_str}).encode(),
        headers={"Authorization": f"Bearer {CJ_PAT}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return {"http_error": e.code, "body": e.read().decode()[:1500]}
    except Exception as e:
        return {"error": f"{type(e).__name__}: {e}"}


# ============================================================
# TEST 1: Auth check
# ============================================================
print("=" * 70)
print("TEST 1: Auth + basic query (Mytheresa US, 'loro piana')")
print("=" * 70)

q1 = f"""{{
  shoppingProducts(
    companyId: "{CID}"
    partnerIds: ["{MYTHERESA['us']}"]
    keywords: ["loro piana"]
    limit: 3
  ) {{
    totalCount
    resultList {{ title brand link availability }}
  }}
}}"""

result = call(q1)
print(json.dumps(result, indent=2)[:2500])


# ============================================================
# TEST 2: Search for known-broken product
# ============================================================
print()
print("=" * 70)
print("TEST 2: Search 'loro piana open walk' (known-broken)")
print("=" * 70)

q2 = f"""{{
  shoppingProducts(
    companyId: "{CID}"
    partnerIds: ["{MYTHERESA['us']}", "{MYTHERESA['intl']}", "{MYTHERESA['uk']}"]
    keywords: ["loro piana open walk"]
    limit: 10
  ) {{
    totalCount
    resultList {{
      advertiserId
      advertiserName
      title
      brand
      link
      imageLink
      availability
      price {{ amount currency }}
    }}
  }}
}}"""

result = call(q2)
if "data" in result and result["data"]:
    sp = result["data"]["shoppingProducts"]
    print(f"Total matches: {sp.get('totalCount')}")
    for i, p in enumerate((sp.get("resultList") or [])[:5], 1):
        print(f"\n  {i}. [{p.get('brand')}] {(p.get('title') or '')[:70]}")
        print(f"     advertiser: {p.get('advertiserName')} ({p.get('advertiserId')})")
        print(f"     availability: {p.get('availability')}")
        price = p.get('price') or {}
        print(f"     price: {price.get('amount')} {price.get('currency')}")
        print(f"     link: {(p.get('link') or '')[:100]}")
else:
    print(json.dumps(result, indent=2)[:2000])


# ============================================================
# TEST 3: Other broken products
# ============================================================
print()
print("=" * 70)
print("TEST 3: Search other broken Loro Piana products")
print("=" * 70)

for kw in ["loro piana sesia", "loro piana cashmere scarf grande unita"]:
    print(f"\n--- '{kw}' ---")
    q = f"""{{
      shoppingProducts(
        companyId: "{CID}"
        partnerIds: ["{MYTHERESA['us']}"]
        keywords: ["{kw}"]
        limit: 3
      ) {{
        totalCount
        resultList {{ title brand link availability price {{ amount currency }} }}
      }}
    }}"""
    r = call(q)
    if "data" in r and r["data"]:
        sp = r["data"]["shoppingProducts"]
        print(f"  Matches: {sp.get('totalCount')}")
        for p in (sp.get("resultList") or [])[:2]:
            print(f"    - {(p.get('title') or '')[:60]}")
            print(f"      avail: {p.get('availability')} | {(p.get('link') or '')[:80]}")
    else:
        err = r.get("body") or r.get("error") or r
        print(f"  Error: {str(err)[:200]}")


# ============================================================
# TEST 4: Sanity check on Toteme (large catalog)
# ============================================================
print()
print("=" * 70)
print("TEST 4: Bulk feed sanity — 'toteme'")
print("=" * 70)

q4 = f"""{{
  shoppingProducts(
    companyId: "{CID}"
    partnerIds: ["{MYTHERESA['us']}"]
    keywords: ["toteme"]
    limit: 5
  ) {{
    totalCount
    resultList {{ title availability }}
  }}
}}"""
r = call(q4)
if "data" in r and r["data"]:
    sp = r["data"]["shoppingProducts"]
    print(f"Total Toteme products in feed: {sp.get('totalCount')}")
    avail_breakdown = {}
    for p in (sp.get("resultList") or []):
        a = p.get("availability") or "unknown"
        avail_breakdown[a] = avail_breakdown.get(a, 0) + 1
    print(f"Availability values seen in sample: {avail_breakdown}")
else:
    print(json.dumps(r, indent=2)[:1000])
