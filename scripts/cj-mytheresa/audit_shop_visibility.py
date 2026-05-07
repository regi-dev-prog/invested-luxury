"""Audit: count products by status, find what's appearing on /shop vs hidden."""
import json, os, urllib.request, urllib.parse

PROJECT = "4b3ap7pf"
DATASET = "production"
QUERY_URL = f"https://{PROJECT}.api.sanity.io/v2024-01-01/data/query/{DATASET}"

token = os.environ["SANITY_TOKEN"]

def query(groq):
    qs = urllib.parse.urlencode({"query": groq})
    req = urllib.request.Request(
        f"{QUERY_URL}?{qs}",
        headers={"Authorization": f"Bearer {token}"},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())["result"]


# 1. All products: count status values
print("=== Status distribution across ALL products ===")
all_products = query('*[_type == "product"]{_id, name, status, "hasImage": defined(images[0]), "hasPrimaryAffil": count(affiliateLinks[isPrimary == true && inStock == true]) > 0, "hasAnyAffil": count(affiliateLinks[inStock == true]) > 0}')
print(f"Total products: {len(all_products)}")
status_count = {}
for p in all_products:
    s = p.get("status") or "(null)"
    status_count[s] = status_count.get(s, 0) + 1
for s, n in sorted(status_count.items()):
    print(f"  status='{s}': {n}")
print()

# 2. The 16 products we touched — what's their status?
print("=== Status of the 16 fixed products ===")
fixed_ids = [
    "product-khaite-arizona-boots", "product-khaite-benny-belt",
    "product-khaite-danielle-jeans", "product-khaite-elena-bag",
    "product-loro-piana-cashmere-robe", "product-loro-piana-extra-pocket-l19",
    "product-loro-piana-grande-unita-scarf", "product-loro-piana-open-walk",
    "product-loro-piana-sesia-micro", "product-the-row-canal-leather-loafer",
    "product-the-row-canal-suede-loafer", "product-the-row-fisherman-sandal-blue",
    "product-the-row-fisherman-sandal-white", "product-the-row-zipped-1-leather-black",
    "product-the-row-zipped-boot-1-suede-brown", "product-toteme-chelsea-boot",
]
ids_str = ",".join(f'"{x}"' for x in fixed_ids)
fixed = query(f'*[_id in [{ids_str}]]{{_id, name, status, "hasImage": defined(images[0]), "primaryInStock": count(affiliateLinks[isPrimary == true && inStock == true]) > 0, "anyInStock": count(affiliateLinks[inStock == true]) > 0}}')
for p in fixed:
    appears_on_shop = (
        p.get("status") == "published" and
        p.get("hasImage") and
        (p.get("primaryInStock") or p.get("anyInStock"))
    )
    flag = "✓ ON /shop" if appears_on_shop else "✗ HIDDEN  "
    print(f"  {flag}  {p['_id'][:50]:50} status='{p.get('status')}', img={p.get('hasImage')}, primaryInStock={p.get('primaryInStock')}, anyInStock={p.get('anyInStock')}")
print()

# 3. Of all published products with image+inStock, how many actually show
print("=== Currently visible on /shop (matches the live query) ===")
visible = query('count(*[_type == "product" && status == "published" && defined(images[0]) && (count(affiliateLinks[isPrimary == true && inStock == true]) > 0 || count(affiliateLinks[inStock == true]) > 0)])')
print(f"  {visible} products visible on /shop")
print()

# 4. What other status values exist that could be confusing?
print("=== Examples of each status (3 each) ===")
for s in status_count.keys():
    if s == "(null)":
        sample = query(f'*[_type == "product" && !defined(status)]{{_id, name}}[0...3]')
    else:
        sample = query(f'*[_type == "product" && status == "{s}"]{{_id, name}}[0...3]')
    print(f"\n  status='{s}':")
    for p in sample:
        print(f"    {p['_id']}: {p.get('name', '?')}")
