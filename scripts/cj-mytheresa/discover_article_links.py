"""Discover the actual GROQ pattern that links articles to products.

Tries several common schema patterns to find which one matches the
data in this Sanity dataset."""
import json
import os
import urllib.request
import urllib.parse

PROJECT = "4b3ap7pf"
DATASET = "production"
QUERY_URL = f"https://{PROJECT}.api.sanity.io/v2024-01-01/data/query/{DATASET}"

token = os.environ["SANITY_TOKEN"]

# Test products — we know the article should reference these
TEST_PRODUCT_IDS = [
    "product-loro-piana-open-walk",
    "product-the-row-canal-leather-loafer",
    "product-loro-piana-grande-unita-scarf",
]


def query(groq):
    qs = urllib.parse.urlencode({"query": groq})
    req = urllib.request.Request(
        f"{QUERY_URL}?{qs}",
        headers={"Authorization": f"Bearer {token}"},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())["result"]


print("=" * 70)
print("STEP 1: Get an article's full structure")
print("=" * 70)
result = query('*[_type == "article"][0]')
if result:
    print("Top-level keys in first article:")
    for k in sorted(result.keys()):
        v = result[k]
        sample = str(v)[:80] if not isinstance(v, (list, dict)) else f"{type(v).__name__}({len(v)} items)"
        print(f"  {k:30} {sample}")
print()

print("=" * 70)
print("STEP 2: Find articles that mention 'product-loro-piana-open-walk' anywhere")
print("=" * 70)
# Try various common patterns
patterns = [
    ('primaryProduct._ref', '*[_type=="article" && primaryProduct._ref == "product-loro-piana-open-walk"]{_id, "slug": slug.current}'),
    ('secondaryProducts[]._ref', '*[_type=="article" && "product-loro-piana-open-walk" in secondaryProducts[]._ref]{_id, "slug": slug.current}'),
    ('relatedProducts[]._ref', '*[_type=="article" && "product-loro-piana-open-walk" in relatedProducts[]._ref]{_id, "slug": slug.current}'),
    ('products[]._ref', '*[_type=="article" && "product-loro-piana-open-walk" in products[]._ref]{_id, "slug": slug.current}'),
    ('body markDefs reference', '*[_type=="article" && "product-loro-piana-open-walk" in body[].markDefs[].reference._ref]{_id, "slug": slug.current}'),
    ('references() function', '*[_type=="article" && references("product-loro-piana-open-walk")]{_id, "slug": slug.current}'),
]
for name, q in patterns:
    try:
        r = query(q)
        if r:
            print(f"  ✓ {name}: matched {len(r)} articles")
            for art in r[:3]:
                print(f"      {art.get('_id', '?')}  slug={art.get('slug', '?')}")
        else:
            print(f"  ✗ {name}: 0 matches")
    except Exception as e:
        print(f"  ! {name}: ERROR {e}")
print()

print("=" * 70)
print("STEP 3: Same but for THE row-canal-leather-loafer (Format A success)")
print("=" * 70)
for name, q in patterns:
    q2 = q.replace("product-loro-piana-open-walk", "product-the-row-canal-leather-loafer")
    try:
        r = query(q2)
        if r:
            print(f"  ✓ {name}: matched {len(r)} articles")
            for art in r[:3]:
                print(f"      {art.get('_id', '?')}  slug={art.get('slug', '?')}")
    except:
        pass
print()

print("=" * 70)
print("STEP 4: Reverse — list all articles, find the one that uses these products")
print("=" * 70)
arts = query("""*[_type == "article"]{
  _id,
  "slug": slug.current,
  "primaryProductRef": primaryProduct._ref,
  "secondaryProductRefs": secondaryProducts[]._ref,
  "bodyRefs": body[].markDefs[]{_type, reference, "ref": reference._ref}
}""")
print(f"  Total articles: {len(arts)}")
for product_id in TEST_PRODUCT_IDS:
    matched = []
    for a in arts:
        if a.get("primaryProductRef") == product_id:
            matched.append(("primaryProduct", a))
            continue
        if product_id in (a.get("secondaryProductRefs") or []):
            matched.append(("secondaryProducts", a))
            continue
        for bref in (a.get("bodyRefs") or []):
            if bref and bref.get("ref") == product_id:
                matched.append(("body markDef", a))
                break
    print(f"\n  {product_id}: {len(matched)} matches")
    for where, a in matched[:5]:
        print(f"    [{where}] {a['_id']}  slug={a.get('slug')}")
