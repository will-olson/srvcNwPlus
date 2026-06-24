# Seed documentation

Example GTM reference corpus for the studio. These files are **optional** — you can skip them entirely and use the **My Uploads** workspace with your own documents.

## What's included

Seven markdown files covering personas, competitive intelligence, vertical playbooks, and GTM strategy. They map to three product clusters used by the cluster-first studio:

| Cluster | Files | Used by templates |
|---------|-------|-------------------|
| **Echelon** | `echelon-personas.md` (Document A), `echelon-verticals.md` (Document B), `echelon-technical-use-cases.md` (Document C), `echelon-competitive-positioning.md` | Buyer persona, pain talk track, vertical campaign, technical discovery, MSP play, ServiceNow battlecard |
| **Profound** | `profound-gtm-strategy.md` | Outbound sequence, objection handler, POV/business case, SEO-suite battlecard |
| **Monte Carlo** | `monte-carlo-competitive-analysis.md`, `monte-carlo-industries.md` | Platform battlecard, vertical trust pitch, agent narrative, industry ROI brief |

The **Competitive** workspace can combine Echelon and Monte Carlo competitive docs (and optionally Profound) for cross-vendor landscape, unified battlecard, and win/loss templates.

## How to load these docs

From the **repo root**, run:

```bash
npm run seed:kb
```

Documents appear in the Sources panel grouped by cluster with a **seed** badge. Re-running is safe — already-seeded files are skipped.

After seeding, open the studio, pick a workspace (e.g. **Echelon**), choose a template, and the correct seed doc(s) auto-bind — no manual selection needed.

## Bring your own

You have three options:

1. **Skip seeding** — Start the app, switch to **My Uploads**, and upload PDF, Markdown, or DOCX files.
2. **Mix both** — Seed these examples to explore templates, then upload your own positioning docs.
3. **Replace the corpus** — Add your own `.md` files to this directory, update [`kb-manifest.json`](../onus-gtm-lite/data/seeds/kb-manifest.json) for cluster labels, add matching templates in [`cluster-workspaces.ts`](../onus-gtm-lite/src/config/cluster-workspaces.ts), and run `npm run seed:kb`.

User uploads can be deleted from the UI. Seed docs are protected and persist across sessions.
