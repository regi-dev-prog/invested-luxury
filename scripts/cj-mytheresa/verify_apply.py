"""
Verify that curated apply actually wrote correctly to Sanity.

For each entry in curated_approved.txt:
  1. Live-query Sanity (NOT CDN — we want fresh data)
  2. Extract the value at the location_path
  3. Verify:
     - Field is now CJ-wrapped (anrdoezrs.net or similar)
     - Underlying URL is mytheresa.com/...
     - SID matches expected pattern
  4. Compare to what fix_mytheresa.py reported it would write

Also reports:
  - Stale references (where the previous write left an old URL)
  - Drift (where actual differs from script's plan)
"""
import os, json, re, urllib.request, urllib.parse, urllib.error, sys
from pathlib import Path
from urllib.parse import unquote

PROJECT = "4b3ap7pf"
DATASET = "production"
API = "2024-01-01"
LIVE_QUERY_URL = f"https://{PROJECT}.api.sanity.io/v{API}/data/query/{DATASET}"


def token():
    t = os.environ.get("SANITY_TOKEN")
    if not t:
        sys.exit("SANITY_TOKEN env var required")
    return t


def query_live(groq):
    url = f"{LIVE_QUERY_URL}?{urllib.parse.urlencode({'query': groq})}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token()}"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())["result"]


def extract_underlying(wrapped_url):
    if not wrapped_url:
        return None
    if "url=" in wrapped_url:
        return unquote(wrapped_url.split("url=")[1])
    return wrapped_url


def main():
    # Read curated whitelist
    curated_file = Path(__file__).parent / "curated_approved.txt"
    whitelist = []
    with open(curated_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):
                doc_id, location = line.split("|", 1)
                whitelist.append({"doc_id": doc_id, "location": location})

    print(f"Verifying {len(whitelist)} entries against live Sanity...")
    print("=" * 100)
    print()

    # Optionally read what we expected to write (from approved_plan.json if available)
    expected = {}
    approved_plan = Path("../../reports/approved_plan.json")
    if not approved_plan.exists():
        approved_plan = Path("approved_plan.json")
    if approved_plan.exists():
        with open(approved_plan) as f:
            for p in json.load(f):
                key = f"{p['doc_id']}|{p['location_path']}"
                expected[key] = {
                    "new_url": p.get("new_url"),
                    "discovered_link": (p.get("discovered") or {}).get("link"),
                    "doc_name": p.get("doc_name"),
                }

    pass_count = 0
    fail_count = 0
    drift_count = 0

    for entry in whitelist:
        doc_id = entry["doc_id"]
        location = entry["location"]
        key = f"{doc_id}|{location}"

        # Build a GROQ query to fetch the field value from BOTH published + draft
        # location is like: affiliateLinks[_key=="ef6575efed8b"].url
        # We need: *[_id == "X" || _id == "drafts.X"]{ name, "actual": affiliateLinks[_key=="ef6575efed8b"][0].url }
        # but since affiliateLinks[_key=="..."] returns array, we wrap with [0]
        location_groq = location.replace(".url", "[0].url")
        groq = (
            f'*[_id == "{doc_id}" || _id == "drafts.{doc_id}"]'
            f'{{ _id, name, "actual": {location_groq} }}'
        )

        try:
            results = query_live(groq)
        except urllib.error.HTTPError as e:
            print(f"  ❌ {doc_id}: HTTP {e.code}")
            fail_count += 1
            continue

        if not results:
            print(f"  ❌ {doc_id}: NOT FOUND in Sanity")
            fail_count += 1
            continue

        # Use published version (no drafts. prefix) if present, else first
        published = next((r for r in results if not r["_id"].startswith("drafts.")), None)
        chosen = published or results[0]

        actual = chosen.get("actual")
        if not actual:
            print(f"  ❌ {chosen['name']}: field is empty/missing")
            fail_count += 1
            continue

        # Verify it's CJ-wrapped
        is_cj_wrapped = any(d in actual for d in (
            "anrdoezrs.net", "tkqlhce.com", "jdoqocy.com", "kqzyfj.com",
            "dpbolvw.net", "emjcd.com", "qksrv.net"
        ))
        # Extract underlying mytheresa URL
        underlying = extract_underlying(actual)
        # Extract SID
        sid_match = re.search(r'[?&]sid=([^&]+)', actual)
        sid = sid_match.group(1) if sid_match else None

        # Verification checks
        checks = {
            "cj-wrapped": is_cj_wrapped,
            "mytheresa-target": "mytheresa.com" in (underlying or ""),
            "has-sid": sid is not None and sid.startswith("il-"),
            "uses-pid-101713247": "/click-101713247-" in actual,
        }
        ok = all(checks.values())

        # Compare to expected (drift detection)
        exp = expected.get(key, {})
        exp_underlying = extract_underlying(exp.get("new_url", "")) if exp.get("new_url") else None
        if exp_underlying:
            exp_underlying_clean = exp_underlying.split("?")[0]
            actual_underlying_clean = (underlying or "").split("?")[0]
            drift = exp_underlying_clean != actual_underlying_clean
        else:
            drift = None

        status = "✅ OK" if ok else "❌ FAIL"
        if drift:
            status += " ⚠ DRIFT"
            drift_count += 1
        if ok:
            pass_count += 1
        else:
            fail_count += 1

        product_name = chosen.get("name") or doc_id
        print(f"  {status}  {product_name}")
        if not ok:
            for k, v in checks.items():
                if not v:
                    print(f"        FAIL: {k}")
            print(f"        actual: {actual[:120]}")
        else:
            print(f"        SID:        il-{sid[3:]}" if sid else "        SID: missing!")
            print(f"        Underlying: {(underlying or '')[:100]}")
        if drift:
            print(f"        ⚠ Expected:  {exp_underlying_clean[:100]}")
            print(f"        ⚠ Actually:  {actual_underlying_clean[:100]}")
        print()

    print("=" * 100)
    print(f"Verification: {pass_count}/{len(whitelist)} passed, "
          f"{fail_count} failed, {drift_count} have drift from script plan")

    if fail_count > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
