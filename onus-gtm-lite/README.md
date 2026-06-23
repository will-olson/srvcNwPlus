# OnusGTM Lite

A lightweight, open-source GTM platform extracted from [OnusGTM](https://github.com). Upload PDF, Markdown, or DOCX documents, select a discipline and use case, and generate grounded GTM artifacts via OpenAI.

No authentication, no Supabase — runs locally with filesystem storage and a single `OPENAI_API_KEY`.

## Quick start

```bash
cd onus-gtm-lite
cp .env.example .env
# Set OPENAI_API_KEY in .env
npm install
npm run seed:kb
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Seed documents load from `../knowledgeBaseDocs` (7 markdown GTM reference docs). Run `npm run seed:kb` after clone or when KB docs change.

## Features

- **Unified GTM chat studio** — Palantir-style operator shell (Sources tree | Operator input | Operator log)
- **5 disciplines** — Brand studio, Product strategy, Enablement & operations, Competitive, Persona positioning
- **20 use cases** — Pillar map, battlecards, campaigns, KPI framework, and more (ported from OnusGTM)
- **Multi-format uploads** — PDF (unpdf), Markdown, DOCX (mammoth)
- **Grounded generation** — KB chunks + document distillates + optional brand voice/wiki from `data/seeds/brand-context.json`
- **Follow-up refinement** — Chat-style follow-ups on the last draft
- **Pluggable AI** — OpenAI (default) or Lovable gateway via env

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | — | Required for OpenAI provider |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI model |
| `AI_PROVIDER` | `openai` | Set to `lovable` for Lovable gateway |
| `LOVABLE_API_KEY` | — | Required when `AI_PROVIDER=lovable` |
| `DATA_DIR` | `./data` | Local storage for documents and history |
| `KB_SEED_DIR` | `../knowledgeBaseDocs` | Source directory for `npm run seed:kb` |
| `DISTILL_ON_INGEST` | `false` | When `true`, run LLM summary distillation on ingest |
| `SEED_KB_ON_START` | `false` | Reserved for optional dev startup seeding |

## Architecture

```
Upload (PDF/MD/DOCX) → section-aware extract → chunk (~4500 chars) → distillate index
                              ↓
Discipline → use case → Dynamic form → buildTask() prompt
                              ↓
         MODULE_SYSTEM + brand context + distillates + KB excerpts
                              ↓
                    OpenAI / Lovable → markdown output
```

### Key paths

| Path | Purpose |
|------|---------|
| `src/config/use-cases.ts` | All 20 generator configs (fields + buildTask) |
| `src/config/disciplines.ts` | 5 GTM pillar definitions |
| `src/lib/kb/` | Ingest, store, chunk |
| `src/lib/generate.ts` | Prompt assembly + AI call |
| `src/components/gtm/UnifiedGtmStudio.tsx` | Main UI |
| `data/seeds/brand-context.json` | Optional voice rules and wiki sections |
| `data/seeds/kb-manifest.json` | Seed doc metadata (cluster, series, title) |
| `data/seeds/translation-fixtures.json` | Integration test scenarios for translation use cases |

## Knowledge base seed docs

| Doc cluster | Files | Recommended use cases |
|-------------|-------|------------------------|
| Echelon | Personas (A), Verticals (B), Technical (C), Competitive | `persona`, `campaign`, `battlecard`, `product-positioning` |
| Profound | GTM strategy playbook | `editorial`, `report`, `battlecard`, `campaign` |
| Monte Carlo | Competitive analysis, Industries | `competitive-landscape`, `report`, `pillars` |

## Testing

```bash
# Unit tests: section-aware markdown ingest + chunking (no API key)
npm run test:ingest

# Seed KB docs from ../knowledgeBaseDocs
npm run seed:kb

# Integration: 4 translation fixtures (requires OPENAI_API_KEY)
npm run test:translation
```

Translation presets in the UI mirror the fixture scenarios (Echelon persona, campaign, battlecard, voice).

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
