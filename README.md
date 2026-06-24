# GTM Tooling Suite

**Eliminate the cold start. Always be building.**

An open-source go-to-market tooling suite built for **bring-your-own-key** AI and **bring-your-own knowledge base** documentation. Load your positioning docs, competitive research, and enablement material once — then generate grounded GTM artifacts on demand instead of starting from a blank page every time.

No vendor lock-in on models. No hosted knowledge store required. Run locally, point at your docs, and ship.

## Why this exists

GTM work has a cold-start problem. Every battlecard, campaign brief, persona doc, and positioning canvas begins with the same slow steps: hunt for source material, re-read context, and hope the draft stays faithful to what you already know.

This suite inverts that workflow:

1. **Ingest** — Load PDF, Markdown, or DOCX into a local knowledge base (or seed the included reference corpus).
2. **Pick a workspace & template** — Choose a product cluster and a bespoke artifact template with product-specific dropdowns.
3. **Generate** — Produce markdown artifacts grounded in the right source docs, with optional brand voice, wiki context, and recent news.
4. **Refine** — Follow up in chat to iterate on the last draft without losing grounding.

Your API key. Your docs. Your outputs.

## Repository layout

```
.
├── package.json                      # npm workspaces root
├── .env                              # API keys (repo root — recommended)
├── packages/
│   ├── onus-gtm-lite/                # Unified GTM studio — the core application
│   └── dependencies/                 # Example KB documents (seed or replace with your own)
```

| Path | Purpose |
|------|---------|
| [`packages/onus-gtm-lite/`](./packages/onus-gtm-lite/) | Local-first GTM studio with cluster-first workspaces and grounded generation |
| [`packages/dependencies/`](./packages/dependencies/) | Seven sample GTM docs grouped by product cluster (Echelon, Profound, Monte Carlo) |
| [`packages/onus-gtm-lite/README.md`](./packages/onus-gtm-lite/README.md) | Architecture, testing, and extension guide |

## Getting started

### Prerequisites

- **Node.js** `>=20.19.0` or `>=22.12.0` (required by Vite 8)
- An **OpenAI API key** (or Lovable gateway credentials — see [environment](#environment))
- Optional: **NewsAPI.org key** for recent-news grounding in drafts

### Step 1 — Clone and install

```bash
git clone <repo-url> gtm-tooling-suite
cd gtm-tooling-suite
npm install
```

This installs the app via npm workspaces. You do not need to `cd` into the package first.

### Step 2 — Configure API keys

Copy the example env file to the **repo root** (recommended — Vite loads from here):

```bash
cp packages/onus-gtm-lite/.env.example .env
```

Open `.env` and set at minimum:

```env
OPENAI_API_KEY=sk-...
```

Optionally add `NEWS_API_KEY` from [newsapi.org](https://newsapi.org/) to enable the Recent news panel in the studio.

### Step 3 — Load documentation (choose one path)

#### Path A — Seed the reference corpus (recommended for first run)

Seven example markdown files live in [`packages/dependencies/`](./packages/dependencies/) — personas, competitive intel, vertical playbooks, and GTM strategy. Load them once:

```bash
npm run seed:kb
```

After seeding, documents appear in the **Sources** panel grouped by cluster with a **seed** badge. Re-running is safe — already-seeded files are skipped.

#### Path B — Bring your own knowledge base

Skip `seed:kb`. After starting the app (Step 4), switch to the **My Uploads** workspace and upload PDF, Markdown, or DOCX files. You can also mix both: seed the examples to explore, then upload your own docs.

See [`packages/dependencies/README.md`](./packages/dependencies/README.md) for the full seed corpus index.

### Step 4 — Start the studio

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Step 5 — Generate your first artifact

The studio uses a **three-step cluster-first flow**. Nothing is auto-selected on load — pick a template and sources bind automatically.

```
1 · Choose workspace     →  Echelon, Profound, Monte Carlo, Competitive, or My Uploads
2 · Choose template      →  Bespoke artifact with product-specific dropdowns
3 · Configure & generate →  Sources auto-bind; fill fields; click Generate draft
```

**Try this first run (with seeded docs):**

1. Confirm **Echelon** is selected in the workspace picker (default).
2. Pick **Buyer persona brief** in the template list.
3. Notice Document A (personas) auto-binds in Sources — no manual checkbox hunting.
4. Select a **Target persona** from the dropdown (e.g. VP Enterprise Applications).
5. Click **Generate draft**.
6. Use **Follow-up refinement** in the operator log to shorten, retone, or add a section.

For your own docs, switch to **My Uploads**, upload files, select them in Sources, pick a template, and generate.

## The studio at a glance

```
┌─────────────────────────────────────────────────────────────────┐
│  Workspace picker: Echelon · Profound · Monte Carlo · …         │
├──────────────┬──────────────────────────┬───────────────────────┤
│  Sources     │  Template + form         │  Operator log         │
│  (seed /     │  (bespoke dropdowns,     │  (draft output,         │
│   uploads)   │   brand toggles)         │   follow-up chat)     │
│              │                          │                       │
│  Recent news │  Generate draft          │  History accordion    │
│  (optional)  │                          │                       │
└──────────────┴──────────────────────────┴───────────────────────┘
```

### Workspaces

Each workspace maps to a product knowledge cluster. Templates within a workspace auto-bind the correct seed documents — you cannot accidentally mix Echelon personas with Profound playbook content unless you explicitly use the **Competitive** workspace.

| Workspace | What it's for | Source binding |
|-----------|---------------|----------------|
| **Echelon** | ServiceNow AI delivery — personas, verticals, technical use cases, MSP displacement | One seed doc per template (Documents A/B/C or competitive) |
| **Profound** | AI search intelligence — outbound, objections, POV, SEO-suite battlecards | Profound GTM playbook |
| **Monte Carlo** | Data reliability & agent trust — platform battlecards, vertical pitches, ROI briefs | Competitive analysis or industry strategy |
| **Competitive** | Cross-product landscape, unified battlecards, win/loss synthesis | Multiple competitive seed docs (only workspace that allows cross-cluster mixing) |
| **My Uploads** | Your own corpus — same artifact shapes, upload-only grounding | You select 1+ uploaded files |

### Templates & artifacts by workspace

Each template produces a structured **markdown artifact** grounded in the bound sources. Outputs include inline citations to KB blocks (and news excerpts when enabled).

#### Echelon (6 templates)

| Template | Artifact type | Typical output |
|----------|---------------|----------------|
| Buyer persona brief | ICP persona | Segment profile, motivations, triggers, pains, value props, talk track |
| Pain-segment talk track | Objection library | Objection handlers keyed to Echelon pain segments |
| Vertical GTM campaign | Multi-channel campaign | LinkedIn cadence, email sequence, paid hooks, sales follow-up for a vertical |
| Technical discovery guide | Enablement asset | Discovery questions, scoping scripts, or one-pagers for a technical use case |
| MSP displacement narrative | Sales play | Narrative and plays against MSP/SI incumbents |
| ServiceNow native battlecard | Battlecard | Counter-positioning vs Now Assist, Devin/Cursor, SI delivery, status-quo MSP |

#### Profound (4 templates)

| Template | Artifact type | Typical output |
|----------|---------------|----------------|
| Vertical outbound sequence | Outbound campaign | Multi-touch outbound for B2B SaaS, finserv, retail, travel, healthcare |
| Mid-funnel objection handler | Objection library | Responses to rank-tracker commoditization, SEO suite consolidation, ROI/proof themes |
| POV / business case | Market report | Proof-of-value narrative by buyer stage (discovery → pilot) |
| SEO-suite battlecard | Battlecard | Counter-positioning vs Ahrefs/Semrush, Peec/Evertune, AirOps/Jasper |

#### Monte Carlo (4 templates)

| Template | Artifact type | Typical output |
|----------|---------------|----------------|
| Platform battlecard | Battlecard | Counter-positioning vs Databricks, Snowflake, Datadog, Agentforce, Notion |
| Vertical trust pitch | Sales play | Industry-specific value story and deal-stage narrative |
| Agent observability narrative | Positioning canvas | Product positioning for agent-trust wedges |
| Industry ROI brief | Market report | Vertical ROI narrative with evidence-backed thesis |

#### Competitive (3 templates — cross-cluster)

| Template | Artifact type | Typical output |
|----------|---------------|----------------|
| Cross-vendor landscape | Landscape map | 2×2 competitive landscape across Echelon + Monte Carlo intel |
| Unified battlecard | Battlecard | Multi-source battlecard spanning ServiceNow, data platform, and SEO archetypes |
| Win/loss synthesis | Win/loss report | Cross-product loss themes (native platform, SI/MSP, DIY point tools) |

#### My Uploads (5 templates)

| Template | Artifact type | Typical output |
|----------|---------------|----------------|
| Persona brief | ICP persona | Persona profile from your uploaded research |
| GTM campaign | Multi-channel campaign | Campaign plan from your playbooks |
| Battlecard | Battlecard | Competitive battlecard from your intel |
| Enablement asset | Enablement asset | One-pager, talk track, or discovery guide |
| Market / POV report | Market report | Structured report from your uploaded research |

### GTM workflows supported

The studio covers the full GTM artifact lifecycle — from foundational positioning through competitive and enablement outputs:

| Workflow | What you do | Example templates |
|----------|-------------|-------------------|
| **ICP & persona development** | Synthesize buyer profiles from deep-dive docs | Echelon buyer persona, upload persona brief |
| **Vertical GTM planning** | Industry-specific campaigns and trust pitches | Echelon vertical campaign, Monte Carlo vertical pitch |
| **Sales enablement** | Discovery guides, talk tracks, objection libraries | Echelon technical discovery, pain-segment talk track, Profound objections |
| **Competitive intelligence** | Battlecards, landscapes, win/loss synthesis | All battlecard templates, competitive landscape, win/loss |
| **Product positioning** | Narrative and wedge positioning | Monte Carlo agent observability narrative |
| **Outbound & demand gen** | Multi-touch sequences by vertical | Profound outbound, Echelon vertical campaign |
| **Executive / POV selling** | Business cases and ROI briefs | Profound POV, Monte Carlo industry ROI |
| **Bring-your-own corpus** | Same shapes on custom uploads | All My Uploads templates |

### Grounding & quality controls

- **Template-bound sources** — Seed workspaces auto-select the right doc(s) per template; no "select all" on load.
- **No cross-cluster mixing** — Server-side validation rejects incompatible source combinations (except Competitive workspace).
- **Section-aware chunking** — Documents are extracted and chunked (~4500 chars) with optional distillate summaries.
- **Citation rules** — Outputs cite KB blocks as `[Doc title · p.N]`; news claims cite `[Publisher · date · headline]`.
- **Brand context** (Echelon) — Optional voice rules and wiki sections from `brand-context.json`.
- **Recent news** (optional) — NewsAPI.org keyword or headline search adds timely market context to drafts.
- **Follow-up refinement** — Chat-style iteration on the last draft preserves grounding context.

## What's included

### OnusGTM Lite

The primary tool in this suite — a lightweight, open-source GTM platform. No authentication, no Supabase. Filesystem storage and your own API keys.

- **Cluster-first studio** — Workspace → template → generate (replaces generic discipline/use-case pickers)
- **~22 bespoke templates** — Product-specific dropdowns tuned to each KB cluster
- **Multi-format uploads** — PDF, Markdown, DOCX
- **Grounded generation** — KB chunks + distillates + optional brand voice/wiki + optional news
- **Follow-up refinement** — Chat-style iteration on the last draft
- **Pluggable AI** — OpenAI (default) or Lovable gateway via environment variables

### Seed documentation vs. your uploads

| | Seeded docs (`npm run seed:kb`) | User uploads (My Uploads workspace) |
|---|--------------------------------|-------------------------------------|
| **Source** | `packages/dependencies/*.md` | PDF, MD, or DOCX from your machine |
| **Required?** | No — optional for first-run demos | No — use instead of or in addition to seeds |
| **In UI** | Grouped by cluster, **seed** badge | Listed under My Uploads; you select manually |
| **Deletable?** | No (protected reference corpus) | Yes |

Generators synthesize from selected source content — they do not invent facts.

## How generation works

```
Upload (PDF / MD / DOCX) → section-aware extract → chunk → distillate index
                                    ↓
         Workspace → template → bespoke form → buildTask() prompt
                                    ↓
    module system + brand context + distillates + KB excerpts + optional news
                                    ↓
                      your AI provider → markdown artifact
```

Each template maps to a specialized system prompt (persona, battlecard, campaign, report, asset, and others) so outputs stay on-format and evidence-backed. See [`packages/onus-gtm-lite/src/lib/prompts/modules.ts`](./packages/onus-gtm-lite/src/lib/prompts/modules.ts) for the full prompt module catalog.

## Environment

Configure in the **repo root** `.env` (or `packages/onus-gtm-lite/.env`):

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | — | Required for OpenAI provider |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI model |
| `AI_PROVIDER` | `openai` | Set to `lovable` for Lovable gateway |
| `LOVABLE_API_KEY` | — | Required when `AI_PROVIDER=lovable` |
| `NEWS_API_KEY` | — | Optional NewsAPI.org key for recent news grounding |
| `NEWS_API_BASE_URL` | `https://newsapi.org/v2` | NewsAPI base URL |
| `NEWS_CACHE_TTL_SEC` | `900` | In-memory news search cache TTL |
| `DATA_DIR` | `./data` | Local storage for documents and history |
| `KB_SEED_DIR` | `../dependencies` | Source directory for `npm run seed:kb` |
| `DISTILL_ON_INGEST` | `false` | When `true`, run LLM summary distillation on ingest |

See [`packages/onus-gtm-lite/README.md`](./packages/onus-gtm-lite/README.md) for provider swap instructions, adding custom templates, and exporting to a standalone repo.

## Root scripts

Run from the repo root:

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the GTM studio dev server |
| `npm run build` | Production build |
| `npm run seed:kb` | Load seed docs from `packages/dependencies/` |
| `npm run test:ingest` | Unit tests for markdown ingest (no API key) |

Package-level tests (selection policy, news formatting, translation fixtures) are documented in [`packages/onus-gtm-lite/README.md`](./packages/onus-gtm-lite/README.md).

## What's next

- **Architecture and testing** — [`packages/onus-gtm-lite/README.md`](./packages/onus-gtm-lite/README.md)
- **Seed corpus details** — [`packages/dependencies/README.md`](./packages/dependencies/README.md)
- **Add a template** — Edit `packages/onus-gtm-lite/src/config/cluster-workspaces.ts`
- **Add a generator** — Edit `packages/onus-gtm-lite/src/config/use-cases.ts`
- **Customize brand context** — Edit `packages/onus-gtm-lite/data/seeds/brand-context.json`

## License

MIT — see [`packages/onus-gtm-lite/LICENSE`](./packages/onus-gtm-lite/LICENSE).
