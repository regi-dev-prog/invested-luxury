"""Verify YSL Cassandre is correctly Mytheresa-linked + visible to /shop query."""
import json, os, urllib.request, urllib.parse

PROJECT = "4b3ap7pf"
DATASET = "production"
URL = f"https://{PROJECT}.api.sanity.io/v2024-01-01/data/query/{DATASET}"
token = os.environ["SANITY_TOKEN"]

def q(g):
    qs = urllib.parse.urlencode({"query": g})
    req = urllib.request.Request(f"{URL}?{qs}", headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())["result"]


print("=== 1. YSL Cassandre Clutch — current state ===")
r = q('*[_id match "*ysl-cassandre*"][0]{_id, name, "brand": brand->name, hidden, affiliateLinks}')
print(json.dumps(r, indent=2, ensure_ascii=False))
print()

# 2. Does the /shop query return it?
print("=== 2. /shop query: does it return YSL Cassandre? ===")
shop_query = """
*[_type == "product"
    && (!defined(hidden) || hidden == false)
    && count(affiliateLinks[
        defined(url)
        && url != ""
        && url != "https://www.mytheresa.com/"
        && url != "https://mytheresa.com/"
    ]) > 0
    && _id match "*ysl-cassandre*"
] {
    _id, name,
    "primaryLink": affiliateLinks[isPrimary == true && defined(url) && url != ""][0]{url, "retailerName": coalesce(retailerName, retailer)},
    "fallbackLink": affiliateLinks[defined(url) && url != "" && url != "https://www.mytheresa.com/"][0]{url, "retailerName": coalesce(retailerName, retailer)}
}
"""
print(json.dumps(q(shop_query), indent=2, ensure_ascii=False))
print()

# 3. Total count in /shop
print("=== 3. /shop total visible product count ===")
r = q("""count(*[_type == "product"
    && (!defined(hidden) || hidden == false)
    && count(affiliateLinks[
        defined(url)
        && url != ""
        && url != "https://www.mytheresa.com/"
        && url != "https://mytheresa.com/"
    ]) > 0])""")
print(f"  {r} products visible on /shop")
print()

# 4. How many have Mytheresa as primary now?
print("=== 4. Products with Mytheresa primary link ===")
r = q("""count(*[_type == "product"
    && count(affiliateLinks[isPrimary == true && retailer match "Mytheresa"]) > 0])""")
print(f"  {r} products have Mytheresa as primary")
