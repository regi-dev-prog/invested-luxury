# CJ + Mytheresa URL Validation & Fix

Scripts to validate Mytheresa affiliate URLs in Sanity, discover current URLs via the CJ Product Search API, and re-wrap them as CJ tracking links.

## What this solves

Some Mytheresa URLs in Sanity (in `affiliateLinks[].url` on products and `body[].markDefs[].href` in articles) point to product pages that no longer exist on Mytheresa, returning 404. CJ tracking still works, but the user lands on an error page and conversion is zero.

This pipeline:

1. **Scans** Sanity for every Mytheresa URL (raw or CJ-wrapped).
2. **Validates** each URL is live (HTTP 200, not soft-404).
3. **Discovers** replacement URLs from the CJ Product Search API for any that fail.
4. **Wraps** the new URLs with the CJ deep-link format (per-product SID).
5. **Writes** the results back to Sanity (with a dry-run mode).

## How to run via GitHub Actions

### One-time setup: add secrets

In the repo: **Settings → Secrets and variables → Actions → New repository secret**

Add two:

- `SANITY_TOKEN` — Sanity write token (Editor scope) for project `4b3ap7pf`
- `CJ_PAT` — Personal Access Token from `developers.cj.com`

### Trigger a run

1. Go to **Actions** tab → **Fix Mytheresa URLs**
2. Click **Run workflow** (top-right)
3. Pick mode + scope:

| Mode | What it does |
|---|---|
| `validate-only` | Reports broken URLs; no CJ search, no writes. Safe first step. |
| `dry-run` | Full pipeline (validate + CJ search + plan), but Sanity writes are simulated only. |
| `apply` | Full pipeline AND writes to Sanity. |

| Scope | Targets |
|---|---|
| `all` | Every Mytheresa URL across products and articles. |
| `broken-only` | Only URLs that fail validation. |
| `wrapped-only` | Only URLs already wrapped with CJ (skip raw URLs). |

### Recommended sequence

```
1. mode=validate-only,  scope=all          → see what's broken
2. mode=dry-run,        scope=broken-only  → preview the auto-fix
3. mode=apply,          scope=broken-only  → fix broken URLs
4. mode=apply,          scope=all          → handle anything new
```

After each run, the **Summary** tab shows a markdown report. The full data dump is uploaded as an artifact.

## How to run locally

```bash
cd scripts/cj-mytheresa
export SANITY_TOKEN=xxx
export CJ_PAT=yyy
python3 fix_mytheresa.py --validate-only   # safest first
python3 fix_mytheresa.py                   # dry-run
python3 fix_mytheresa.py --apply           # write to Sanity
```

## Files

- `wrap_utils.py` — URL parsing, SID generation, CJ wrap construction
- `validate.py` — HTTP validator with soft-404 detection
- `cj_search.py` — CJ Product Search API client (GraphQL)
- `sanity_io.py` — Sanity HTTP client (query + mutate)
- `fix_mytheresa.py` — End-to-end orchestrator (entry point)

## Output

Each run produces:

- `REPORT.md` — Human-readable summary with TODO list for unfixable items
- `targets.json` — Every Mytheresa URL found, with validation + discovery results
- `mutation_plan.json` — Exact list of changes (only the ones planned/applied)

## Idempotency

Safe to re-run. The script:

- Detects URLs that are already CJ-wrapped (any of: anrdoezrs.net, tkqlhce.com, dpbolvw.net, kqzyfj.com, jdoqocy.com, emjcd.com, qksrv.net) and validates the underlying mytheresa URL.
- Skips homepage URLs (`https://www.mytheresa.com/`) — they need manual product hunting.
- Adds `?dryRun=true` to mutations unless `--apply` is set.

## Configuration

CJ Publisher details are in `wrap_utils.py`:

```python
CJ_PID = "101713247"
LINK_IDS = {
    "us":   "15513564",  # Mytheresa US/CA
    "uk":   "15512623",  # Mytheresa UK
    "intl": "15513483",  # Mytheresa International
}
```

Currently only US Link ID is used. To add geo-routing, modify `wrap_url()` in `wrap_utils.py` and `discover_replacements()` in `fix_mytheresa.py`.
