# OnusGTM Lite

A lightweight, open-source GTM platform extracted from [OnusGTM](https://github.com). Upload PDF, Markdown, or DOCX documents, select a discipline and use case, and generate grounded GTM artifacts via OpenAI.

No authentication, no Supabase — runs locally with filesystem storage, OpenAI (or Lovable), and optional NewsAPI.org recent-news grounding.

> **First time here?** See the [root README](../../README.md) for clone-to-first-generation setup.

## Quick start

From the **repo root**:

```bash
npm install
cp packages/onus-gtm-lite/.env.example .env
# Set OPENAI_API_KEY (and optional NEWS_API_KEY) in repo-root .env
npm run seed:kb
npm run dev
```

Or from this directory:

```bash
cp .env.example .env
npm install
npm run seed:kb
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Seed documents load from [`../dependencies`](../dependencies/) (7 markdown GTM reference docs). Run `npm run seed:kb` after clone or when KB docs change.

## Features

- **Cluster-first studio** — Pick Echelon, Profound, Monte Carlo, Competitive, or My Uploads; choose a bespoke template; generate
- **Template-bound sources** — Seed docs auto-select per template (nothing selected by default until a template binds sources)
- **No cross-cluster mixing** — Except in the Competitive workspace for landscape/battlecard/win-loss artifacts
- **Product-specific inputs** — Dropdowns tuned to each KB (personas, verticals, competitors, objection themes)
- **Multi-format uploads** — PDF (unpdf), Markdown, DOCX (mammoth) in a separate My Uploads workspace
- **Grounded generation** — KB chunks + document distillates + optional Echelon brand voice/wiki
- **Recent news grounding** — NewsAPI.org keyword or top-headlines search with article preview/selection
- **Follow-up refinement** — Chat-style follow-ups on the last draft
- **Pluggable AI** — OpenAI (default) or Lovable gateway via env

## Environment

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
| `SEED_KB_ON_START` | `false` | Reserved for optional dev startup seeding |

Env files are loaded from the **monorepo root** (`.env`) or this package directory. Vite `envDir` points at the repo root so a single root `.env` works for dev.

## Architecture

```
Upload (PDF/MD/DOCX) → section-aware extract → chunk (~4500 chars) → distillate index
                              ↓
Workspace → template → bespoke form → buildTask() prompt
                              ↓
    MODULE_SYSTEM + brand context + distillates + KB excerpts + optional NewsAPI articles
                              ↓
                    OpenAI / Lovable → markdown output
```

### Studio flow

1. **Choose product workspace** — Echelon, Profound, Monte Carlo, Competitive, or My Uploads
2. **Choose artifact template** — Bespoke templates with product-specific dropdowns
3. **Configure inputs** — Sources auto-bind from the template; click **Generate draft**

### Key paths

| Path | Purpose |
|------|---------|
| `src/config/cluster-workspaces.ts` | Workspace + bespoke template definitions |
| `src/lib/kb/selection-policy.ts` | Source mixing rules and validation |
| `src/config/use-cases.ts` | Generator buildTask implementations |
| `src/lib/kb/` | Ingest, store, chunk |
| `src/lib/generate.ts` | Prompt assembly + AI call |
| `src/lib/news/` | NewsAPI.org client, search cache, prompt formatting |
| `src/lib/env.ts` | Typed env accessors + service health status |
| `src/components/gtm/UnifiedGtmStudio.tsx` | Main UI |
| `src/components/gtm/NewsPanel.tsx` | News search selectors + article preview |
| `data/seeds/brand-context.json` | Optional voice rules and wiki sections |
| `data/seeds/kb-manifest.json` | Seed doc metadata (cluster, series, title) |
| `data/seeds/translation-fixtures.json` | Integration test scenarios for translation use cases |

## Knowledge base seed docs

| Workspace | Templates | Auto-bound seed doc(s) |
|-----------|-----------|-------------------------|
| Echelon | Persona, pain talk track, vertical campaign, technical discovery, MSP play, battlecard | Document A, B, C, or competitive (one per template) |
| Profound | Outbound, objections, POV, battlecard | Profound GTM playbook |
| Monte Carlo | Platform battlecard, vertical pitch, agent narrative, industry report | Competitive analysis or industry strategy |
| Competitive | Landscape, unified battlecard, win/loss | Cross-cluster competitive docs only |
| My Uploads | Persona, campaign, battlecard, asset, report | Your uploaded files only |

## Testing

```bash
# Unit tests: selection policy (no API key)
npm run test:selection

# Unit tests: section-aware markdown ingest + chunking (no API key)
npm run test:ingest

# Unit tests: news formatting + query helpers (no API key)
npm run test:news

# Seed KB docs from ../dependencies
npm run seed:kb

# Integration: 4 translation fixtures (requires OPENAI_API_KEY)
npm run test:translation
```

Templates in the UI replace the old discipline tabs and translation preset chips.

## Adding a use case

Edit `src/config/use-cases.ts`:

```typescript
{
  id: "my-use-case",
  discipline: "product-strategy",
  module: "pillars", // maps to MODULE_SYSTEM in src/lib/prompts/modules.ts
  eyebrow: "Product strategy",
  title: "My generator",
  intro: "What it does…",
  fields: [
    { name: "topic", label: "Topic", type: "text", required: true },
  ],
  buildTask: (v) => `Generate X for topic: ${v.topic}`,
}
```

## Export to standalone repo

From this directory:

```bash
chmod +x scripts/export-repo.sh
./scripts/export-repo.sh ../my-gtm-repo
cd ../my-gtm-repo && npm install && npm run dev
```

## Swapping AI providers

**OpenAI (default):**

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

**Lovable gateway:**

```env
AI_PROVIDER=lovable
LOVABLE_API_KEY=...
LOVABLE_MODEL=google/gemini-2.5-flash
```

## Brand context

Customize `data/seeds/brand-context.json` with your voice rules and wiki sections. Enable/disable via checkboxes in the operator input panel.

## License

MIT — see [LICENSE](LICENSE).
