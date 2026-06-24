# Seed documentation

Example GTM reference corpus for the studio. These files are **optional** — you can skip them entirely and upload your own documents in the UI.

## What's included

Seven markdown files covering personas, competitive intelligence, vertical playbooks, and GTM strategy. They are grouped into three clusters:

| Cluster | Files | Good for |
|---------|-------|----------|
| **Echelon** | `echelon-personas.md`, `echelon-verticals.md`, `echelon-technical-use-cases.md`, `echelon-competitive-positioning.md` | Persona, campaign, battlecard, product-positioning use cases |
| **Profound** | `profound-gtm-strategy.md` | Editorial, report, battlecard, campaign use cases |
| **Monte Carlo** | `monte-carlo-competitive-analysis.md`, `monte-carlo-industries.md` | Competitive landscape, report, pillars use cases |

## How to load these docs

From the **repo root**, run:

```bash
npm run seed:kb
```

Documents appear in the Sources panel grouped by cluster with a **seed** badge. Re-running is safe — already-seeded files are skipped.

## Bring your own

You have three options:

1. **Skip seeding** — Start the app and upload PDF, Markdown, or DOCX files in the Sources panel.
2. **Mix both** — Seed these examples, then upload your own positioning docs on top.
3. **Replace the corpus** — Add your own `.md` files to this directory, update [`kb-manifest.json`](../onus-gtm-lite/data/seeds/kb-manifest.json) if you want cluster labels, and run `npm run seed:kb`.

User uploads can be deleted from the UI. Seed docs are protected and persist across sessions.
