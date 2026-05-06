"""Fetch the live article page and find what URL is in the Shop button."""
import urllib.request, re, json

PAGE_URL = "https://investedluxury.com/fashion/quiet-luxury/loro-piana-beyond-sweater-guide"
SANITY_API_URL = "https://4b3ap7pf.apicdn.sanity.io/v2024-01-01/data/query/production"

# 1. Get current state from Sanity (ground truth)
import urllib.parse
groq = '*[_id == "product-loro-piana-open-walk"][0].affiliateLinks[0].url'
q_url = f"{SANITY_API_URL}?{urllib.parse.urlencode({'query': groq})}"
with urllib.request.urlopen(q_url, timeout=30) as r:
    sanity_url = json.loads(r.read())["result"]
print(f"=== SANITY (apicdn) currently has: ===")
print(f"  {sanity_url}")
print()

# 2. Fetch the live page HTML
print(f"=== Fetching {PAGE_URL} ===")
req = urllib.request.Request(
    PAGE_URL,
    headers={
        # Googlebot UA — allowed by middleware bot protection
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
    }
)
with urllib.request.urlopen(req, timeout=30) as r:
    html = r.read().decode("utf-8", errors="ignore")
    headers = dict(r.headers)
print(f"  Status: {r.status}, length: {len(html)}")
print()

# 3. Cache-related headers
print("=== Vercel/CDN headers ===")
for k in ["x-vercel-cache", "cf-cache-status", "age", "cache-control", "etag", "last-modified", "x-vercel-id", "server"]:
    if k in {h.lower() for h in headers}:
        actual_key = next(h for h in headers if h.lower() == k)
        print(f"  {actual_key}: {headers[actual_key]}")
print()

# 4. Find all anrdoezrs URLs in the HTML
print("=== anrdoezrs URLs in rendered HTML ===")
urls = re.findall(r'https://www\.anrdoezrs\.net/[^\s"\']+', html)
unique = list(dict.fromkeys(urls))
for u in unique[:10]:
    print(f"  {u[:160]}")
print(f"  (total {len(urls)} occurrences, {len(unique)} unique)")
print()

# 5. Find all mytheresa URLs (raw, not wrapped)
print("=== Raw mytheresa.com references in HTML ===")
raw = re.findall(r'mytheresa\.com[^\s"\'\\]+', html)
unique_raw = list(dict.fromkeys(raw))
for u in unique_raw[:10]:
    print(f"  {u[:140]}")

# 6. Specifically check if the OLD URL is still in the page
print()
old = "p00795149"
new = "2575114"
print(f"=== Searching for OLD product ID '{old}' and NEW '{new}' ===")
old_count = html.count(old)
new_count = html.count(new)
print(f"  Occurrences of OLD ({old}): {old_count}")
print(f"  Occurrences of NEW ({new}): {new_count}")
