"""Sanity HTTP wrappers — query (CDN) + mutate (write)."""
import os
import json
import urllib.request
import urllib.parse
import urllib.error

PROJECT = "4b3ap7pf"
DATASET = "production"
API_VERSION = "2024-01-01"

# CDN endpoint for reads (fast, public-cacheable, no auth needed for queries)
QUERY_URL = f"https://{PROJECT}.apicdn.sanity.io/v{API_VERSION}/data/query/{DATASET}"
# Live endpoint for writes (requires auth)
MUTATE_URL = f"https://{PROJECT}.api.sanity.io/v{API_VERSION}/data/mutate/{DATASET}"
# Live endpoint for fresh reads (post-mutation verification)
LIVE_QUERY_URL = f"https://{PROJECT}.api.sanity.io/v{API_VERSION}/data/query/{DATASET}"


def _token() -> str:
    t = os.environ.get("SANITY_TOKEN")
    if not t:
        raise RuntimeError("SANITY_TOKEN env var not set")
    return t


def query(groq: str, *, live: bool = False) -> dict:
    """Run a GROQ query. Use live=True for post-write verification."""
    base = LIVE_QUERY_URL if live else QUERY_URL
    url = f"{base}?{urllib.parse.urlencode({'query': groq})}"
    headers = {}
    if live:
        headers["Authorization"] = f"Bearer {_token()}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())["result"]


def mutate(mutations: list, *, dry_run: bool = True) -> dict:
    """Execute mutations. dry_run=True validates without saving."""
    qs = "?dryRun=true&returnDocuments=false" if dry_run else "?returnDocuments=false"
    req = urllib.request.Request(
        MUTATE_URL + qs,
        data=json.dumps({"mutations": mutations}).encode(),
        headers={
            "Authorization": f"Bearer {_token()}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        raise RuntimeError(f"Sanity HTTP {e.code}: {body}") from None


if __name__ == "__main__":
    n = query('count(*[_type == "product"])')
    print(f"Sanity reachable. Total products: {n}")
    if "SANITY_TOKEN" in os.environ:
        # Empty mutate sanity-check
        r = mutate([], dry_run=True)
        print(f"Write token valid. Test transaction: {r.get('transactionId', '?')}")
    else:
        print("(SANITY_TOKEN not set — write capability not tested)")
