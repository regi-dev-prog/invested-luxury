import json, os, urllib.request, urllib.parse
PROJECT = "4b3ap7pf"
URL = f"https://{PROJECT}.api.sanity.io/v2024-01-01/data/query/production"
token = os.environ["SANITY_TOKEN"]
def q(g):
    qs = urllib.parse.urlencode({"query": g})
    req = urllib.request.Request(f"{URL}?{qs}", headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())["result"]

print("=== All featured == true products ===")
r = q('*[_type == "product" && featured == true]{_id, name, "brand": brand->name, "imageCount": count(images), "linkCount": count(affiliateLinks), "primaryRetailer": affiliateLinks[isPrimary == true][0].retailer} | order(displayOrder asc, _createdAt desc)')
print(f"Total: {len(r)}")
for p in r:
    print(f"  {p['_id']}: {p.get('brand')}/{p.get('name')[:40]} | imgs={p['imageCount']}, links={p['linkCount']}, primary={p.get('primaryRetailer','?')}")
print()

# How many would pass the new query?
print("=== Would pass new query (featured + image + valid affiliate) ===")
r2 = q('''count(*[_type == "product"
    && featured == true
    && (!defined(hidden) || hidden == false)
    && defined(images) && count(images) > 0
    && count(affiliateLinks[
        defined(url)
        && url != ""
        && url != "https://www.mytheresa.com/"
        && url != "https://mytheresa.com/"
    ]) > 0])''')
print(f"  {r2} would pass")
