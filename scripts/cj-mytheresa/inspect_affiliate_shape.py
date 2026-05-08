"""Inspect existing affiliateLink shape in Sanity (which fields, what values)."""
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


# 1. A YSL product I saw on /shop
print("=== Saint Laurent Cassandre Large Clutch ===")
r = q('*[_type == "product" && name match "*Cassandre Large*"][0]{_id, name, affiliateLinks}')
print(json.dumps(r, indent=2, ensure_ascii=False))
print()

# 2. A Mytheresa-wrapped product (we know this works)
print("=== Khaite Danielle Jeans (Mytheresa wrapped) ===")
r = q('*[_id == "product-khaite-danielle-jeans"][0]{_id, name, affiliateLinks}')
print(json.dumps(r, indent=2, ensure_ascii=False))
print()

# 3. Show all unique retailer values across all products
print("=== Unique retailer field values across all products ===")
r = q("""array::unique(*[_type == "product"].affiliateLinks[].retailer)""")
print(r)
print()

# 4. Same for retailerName (might be different field)
print("=== Unique retailerName field values ===")
r = q("""array::unique(*[_type == "product"].affiliateLinks[].retailerName)""")
print(r)
