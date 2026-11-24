# Weekly sweep files

The weekly update sweep (a Claude scheduled task, Mondays) writes one file here per week and opens a PR.

- **On the PR:** `sweep-check.yml` checks every change against live Sanity content (read-only) and comments the result.
- **On merge:** `sweep-apply.yml` writes the changes to Sanity as **drafts**. Nothing is published automatically. Open Studio, review each draft, publish.

Merging the PR is the approval. To drop a single change, delete it from the file on the PR branch before merging.

## Format

```json
{
  "sweep": "2026-11-30",
  "changes": [
    {
      "type": "article_text",
      "article": "the-row-dupes",
      "field": "body",
      "find": "The Row Gala Pant costs $1,090",
      "replace": "The Row Gala Pant costs $1,190",
      "substantive": true,
      "reason": "Price increase on therow.com",
      "source": "https://www.therow.com/products/gala-pant-black-1",
      "capturedAt": "2026-11-30"
    },
    {
      "type": "product_price",
      "product": "product-abc123",
      "price": 1190,
      "reason": "Price increase",
      "source": "https://www.therow.com/products/gala-pant-black-1",
      "capturedAt": "2026-11-30"
    }
  ]
}
```

### Rules the script enforces

- `article_text`: `find` must occur **exactly once** in the field (default `body`; any top-level string such as `excerpt`, or `seo.metaDescription`). If it occurs more than once, make `find` longer. If it crosses bold or link formatting, the change is reported as SPLIT and must be done by hand.
- `substantive: true` sets the article's `updatedAt` to the apply time (feeds dateModified and the sitemap). Use it only for a changed price, verdict or finding, never for typos or links.
- `product_price`: sets `price` and `priceLastVerified`, and appends to `priceHistory`.
- Every change needs `source` (URL), `capturedAt` (YYYY-MM-DD) and `reason`. No em dashes in `replace`.
- Re-running is safe: changes already present are reported as ALREADY and skipped.

### What the sweep does not put here

Changes that need new reporting, a new verdict, or restructuring go to an IL-Research handoff instead. Those are listed in the weekly report, not in this file.
