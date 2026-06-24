# GTM Tooling Suite

**Eliminate the cold start. Always be building.**

An open-source go-to-market tooling suite built for **bring-your-own-key** AI and **bring-your-own knowledge base** documentation. Upload your positioning docs, competitive research, and enablement material once — then generate grounded GTM artifacts on demand instead of starting from a blank page every time.

No vendor lock-in on models. No hosted knowledge store required. Run locally, point at your docs, and ship.

## Why this exists

GTM work has a cold-start problem. Every battlecard, campaign brief, persona doc, and positioning canvas begins with the same slow steps: hunt for source material, re-read context, and hope the draft stays faithful to what you already know.

This suite inverts that workflow:

1. **Ingest** — Load PDF, Markdown, or DOCX into a local knowledge base.
2. **Select** — Pick a GTM discipline and use case (pillar map, battlecard, campaign, KPI framework, and more).
3. **Generate** — Produce markdown artifacts grounded in your documents, with optional brand voice and wiki context.
4. **Refine** — Follow up in chat to iterate on the last draft without losing grounding.

Your API key. Your docs. Your outputs.

## Repository layout

```
.
├── package.json                      # npm workspaces root
├── packages/
│   ├── onus-gtm-lite/                # Unified GTM studio — the core application
│   └── dependencies/                 # Example KB documents (seed or replace with your own)
```

| Path | Purpose |
|------|---------|
| [`packages/onus-gtm-lite/`](./packages/onus-gtm-lite/) | Local-first GTM studio with 5 disciplines, 20 use cases, and grounded generation |
| [`packages/dependencies/`](./packages/dependencies/) | Sample positioning, persona, competitive, and strategy docs for seeding a KB |
| [`packages/onus-gtm-lite/README.md`](./packages/onus-gtm-lite/README.md) | Architecture, testing, and extension guide |

## Getting started

### Prerequisites

- **Node.js** `>=20.19.0` or `>=22.12.0` (required by Vite 8)
- An **OpenAI API key** (or Lovable gateway credentials — see [environment](#environment))

### Step 1 — Clone the repository

```bash
git clone <repo-url> gtm-tooling-suite
cd gtm-tooling-suite
```

### Step 2 — Install dependencies

From the repo root:

```bash
npm install
```

This installs the app workspace via npm workspaces. You do not need to `cd` into the package first.

### Step 3 — Configure your API key

```bash
cp packages/onus-gtm-lite/.env.example packages/onus-gtm-lite/.env
```

Open `packages/onus-gtm-lite/.env` and set your key:

```env
OPENAI_API_KEY=sk-...
```

### Step 4 — Load documentation (choose one path)

You can use the included reference corpus, bring your own files, or mix both.

#### Path A — Use seeded reference docs (recommended for first run)

Seven example markdown files live in [`packages/dependencies/`](./packages/dependencies/) — personas, competitive intel, vertical playbooks, and GTM strategy. Load them once:

```bash
npm run seed:kb
```

After seeding, documents appear in the **Sources** panel grouped by cluster with a **seed** badge. Re-running is safe — already-seeded files are skipped.

#### Path B — Bring your own knowledge base

Skip `seed:kb` entirely. After starting the app (Step 5), use **Upload** in the Sources panel to add PDF, Markdown, or DOCX files. User uploads are deletable and can appear alongside seed docs.

You can also combine paths: seed the examples to explore the studio, then upload your own positioning docs on top.

See [`packages/dependencies/README.md`](./packages/dependencies/README.md) for the full seed corpus index.

### Step 5 — Start the studio

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Step 6 — Generate your first artifact

1. Select one or more source documents in the left **Sources** panel.
2. Pick a **discipline** and **use case** (e.g. Competitive → Battlecard).
3. Fill in the form fields and click generate.
4. Use follow-up chat in the operator log to refine the draft.

## What's included

### OnusGTM Lite

The primary tool in this suite — a lightweight, open-source GTM platform extracted from [OnusGTM](https://github.com). No authentication, no Supabase. Filesystem storage and a single API key.

- **Unified GTM chat studio** — Operator shell with sources tree, structured input, and generation log
- **5 disciplines** — Brand studio, Product strategy, Enablement & operations, Competitive, Persona positioning
- **20 use cases** — Voice extractor, wiki drafter, pillar map, battlecards, campaigns, KPI framework, buyer journey maps, and more
- **Multi-format uploads** — PDF, Markdown, DOCX
- **Grounded generation** — KB chunks plus optional brand voice/wiki from `data/seeds/brand-context.json`
- **Follow-up refinement** — Chat-style iteration on the last draft
- **Pluggable AI** — OpenAI (default) or Lovable gateway via environment variables

### Seed documentation vs. your uploads

| | Seeded docs (`npm run seed:kb`) | User uploads (UI) |
|---|--------------------------------|-------------------|
| **Source** | `packages/dependencies/*.md` | PDF, MD, or DOCX from your machine |
| **Required?** | No — optional for first-run demos | No — use instead of or in addition to seeds |
| **In UI** | Grouped by cluster, **seed** badge | Listed with uploads |
| **Deletable?** | No (protected reference corpus) | Yes |

The generators synthesize from selected source content — they do not invent facts.

## How generation works

```
Upload (PDF / MD / DOCX) → chunk (~4500 chars) → local store
                                    ↓
              Discipline → Use case → dynamic form → task prompt
                                    ↓
           module system + brand context + KB excerpts
                                    ↓
                      your AI provider → markdown artifact
```

Every use case maps to a specialized system prompt (content brief, battlecard, persona, campaign, KPI, and others) so outputs stay on-format and evidence-backed.

## Environment

Configure in `packages/onus-gtm-lite/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | — | Required for OpenAI provider |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI model |
| `AI_PROVIDER` | `openai` | Set to `lovable` for Lovable gateway |
| `LOVABLE_API_KEY` | — | Required when `AI_PROVIDER=lovable` |
| `DATA_DIR` | `./data` | Local storage for documents and history |
| `KB_SEED_DIR` | `../dependencies` | Source directory for `npm run seed:kb` |

See [`packages/onus-gtm-lite/README.md`](./packages/onus-gtm-lite/README.md) for provider swap instructions, adding custom use cases, and exporting to a standalone repo.

## What's next

- **Architecture and testing** — [`packages/onus-gtm-lite/README.md`](./packages/onus-gtm-lite/README.md)
- **Seed corpus details** — [`packages/dependencies/README.md`](./packages/dependencies/README.md)
- **Add a use case** — Edit `packages/onus-gtm-lite/src/config/use-cases.ts`
- **Customize brand context** — Edit `packages/onus-gtm-lite/data/seeds/brand-context.json`

## Root scripts

Run from the repo root:

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the GTM studio dev server |
| `npm run build` | Production build |
| `npm run seed:kb` | Load seed docs from `packages/dependencies/` |
| `npm run test:ingest` | Unit tests for markdown ingest (no API key) |

## License

MIT — see [`packages/onus-gtm-lite/LICENSE`](./packages/onus-gtm-lite/LICENSE).
