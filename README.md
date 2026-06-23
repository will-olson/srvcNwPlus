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
├── onus-gtm-lite/       # Unified GTM studio — the core application
├── knowledgeBaseDocs/   # Example KB documents (upload these or use your own)
└── .env                 # Optional root env; see onus-gtm-lite/.env.example
```

| Path | Purpose |
|------|---------|
| [`onus-gtm-lite/`](./onus-gtm-lite/) | Local-first GTM studio with 5 disciplines, 20 use cases, and grounded generation |
| [`onus-gtm-lite/README.md`](./onus-gtm-lite/README.md) | Detailed setup, architecture, and extension guide |
| [`knowledgeBaseDocs/`](./knowledgeBaseDocs/) | Sample positioning, persona, competitive, and strategy docs for seeding a KB |

## Quick start

```bash
cd onus-gtm-lite
cp .env.example .env
# Set OPENAI_API_KEY in .env
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), upload documents from `knowledgeBaseDocs/` (or your own), select a generator, and run.

**Requirements:** Node.js `>=20.19.0` or `>=22.12.0`

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

### Knowledge base docs

The `knowledgeBaseDocs/` directory holds example source material — competitive analyses, persona deep dives, vertical playbooks, and strategy foundations. Use them to seed the studio or replace them with your own corpus. The generators are designed to cite and synthesize from uploaded content, not invent facts.

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

Configure in `onus-gtm-lite/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | — | Required for OpenAI provider |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI model |
| `AI_PROVIDER` | `openai` | Set to `lovable` for Lovable gateway |
| `LOVABLE_API_KEY` | — | Required when `AI_PROVIDER=lovable` |
| `DATA_DIR` | `./data` | Local storage for documents and history |

See [`onus-gtm-lite/README.md`](./onus-gtm-lite/README.md) for provider swap instructions, adding custom use cases, and exporting to a standalone repo.

## Extending the suite

- **Add a use case** — Edit `onus-gtm-lite/src/config/use-cases.ts` (fields + `buildTask` prompt builder)
- **Customize brand context** — Edit `onus-gtm-lite/data/seeds/brand-context.json`
- **Export standalone** — Run `onus-gtm-lite/scripts/export-repo.sh` to copy the app to its own directory

## License

MIT — see [`onus-gtm-lite/LICENSE`](./onus-gtm-lite/LICENSE).
