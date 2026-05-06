"""
Debug-only: verify CJ Product Search API connectivity and discover the right schema.
Run via GitHub Actions to bypass network restrictions.
"""
import os, json, urllib.request, urllib.error

CJ_PAT = os.environ["CJ_PAT"]
CID = "101713247"
ENDPOINT = "https://ads.api.cj.com/query"

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
        return {"http_error": e.code, "body": e.read().decode()[:1000]}
    except Exception as e:
        return {"error": f"{type(e).__name__}: {e}"}

# Test 1: Introspection - find available query fields
print("=" * 70)
print("TEST 1: Introspect available query fields")
print("=" * 70)
introspect = """
{
  __schema {
    queryType {
      fields {
        name
        description
        args { name type { name kind } }
      }
    }
  }
}
"""
result = call(introspect)
if "data" in result and result["data"]:
    fields = result["data"]["__schema"]["queryType"]["fields"]
    print(f"Available query fields ({len(fields)}):")
    for f in fields[:30]:
        print(f"  - {f['name']}: {(f.get('description') or '')[:80]}")
else:
    print(json.dumps(result, indent=2)[:1500])

# Test 2: Try common product-search field names
print()
print("=" * 70)
print("TEST 2: Try common product/shopping query names")
print("=" * 70)

test_queries = {
    "products": '{ products(companyId: "%s", partnerIds: ["2817689"], keywords: ["loro piana"], limit: 2) { totalCount resultList { title brand link } } }' % CID,
    "shoppingProducts": '{ shoppingProducts(companyId: "%s", partnerIds: ["2817689"], keywords: ["loro piana"], limit: 2) { totalCount resultList { title brand link } } }' % CID,
    "productSearch": '{ productSearch(companyId: "%s", partnerIds: ["2817689"], keywords: ["loro piana"], limit: 2) { totalCount resultList { title brand link } } }' % CID,
}

for name, q in test_queries.items():
    print(f"\n--- Trying field: {name} ---")
    result = call(q)
    if "data" in result and result["data"]:
        data = result["data"].get(name)
        if data is not None:
            print(f"  ✓ FIELD EXISTS")
            print(f"  Total: {data.get('totalCount')}")
            for item in (data.get('resultList') or [])[:2]:
                print(f"    - [{item.get('brand')}] {item.get('title', '')[:60]}")
                print(f"      → {item.get('link', '')[:80]}")
            break
    else:
        err = result.get("body") or result.get("errors") or result
        print(f"  ✗ Failed: {str(err)[:200]}")

# Test 3: Specific search for the broken product
print()
print("=" * 70)
print("TEST 3: Search for 'loro piana open walk'")
print("=" * 70)
# Use the field that worked above (will be set in last successful test)
q3 = '{ products(companyId: "%s", partnerIds: ["2817689", "4189905", "2816786"], keywords: ["loro piana open walk"], limit: 5) { totalCount resultList { title brand link advertiserId availability price { amount currency } } } }' % CID
result = call(q3)
print(json.dumps(result, indent=2)[:2000])
