import type { DisciplineId } from "./disciplines";

export type GeneratorField =
  | {
      name: string;
      label: string;
      type: "text";
      placeholder?: string;
      required?: boolean;
      suggestions?: string[];
    }
  | {
      name: string;
      label: string;
      type: "textarea";
      placeholder?: string;
      rows?: number;
      required?: boolean;
      suggestions?: string[];
    }
  | {
      name: string;
      label: string;
      type: "select";
      options: { value: string; label: string }[];
      required?: boolean;
    }
  | {
      name: string;
      label: string;
      type: "checkbox";
      description?: string;
    };

export type UseCaseConfig = {
  id: string;
  discipline: DisciplineId;
  module: string;
  eyebrow: string;
  title: string;
  intro: string;
  fields: GeneratorField[];
  buildTask: (values: Record<string, string>) => string;
};

export const USE_CASES: UseCaseConfig[] = [
  {
    id: "voice",
    discipline: "brand-studio",
    module: "voice",
    eyebrow: "Brand studio",
    title: "Voice extractor",
    intro: "Read the knowledge base and propose do/don't voice rules with short, verbatim examples lifted from source text.",
    fields: [
      {
        name: "focus",
        label: "Lens (optional)",
        type: "text",
        placeholder: "e.g. LinkedIn-only, or sales emails specifically",
        suggestions: [
          "LinkedIn posts only",
          "Outbound sales emails",
          "RFP and procurement responses",
          "Investor and board updates",
          "Long-form whitepapers and reports",
        ],
      },
    ],
    buildTask: (v) => `Extract concrete brand voice rules from the knowledge base.
Lens: ${v.focus || "all surfaces"}

Return two markdown sections:
## DO — 8–12 rules
For each: one-line rule + a short verbatim example in quotes with [Title · p.N].

## DON'T — 6–10 rules
Same format. Prefer examples that show the failure mode being avoided.`,
  },
  {
    id: "wiki",
    discipline: "brand-studio",
    module: "wiki",
    eyebrow: "Brand studio",
    title: "Wiki drafter",
    intro: "Draft canonical brand wiki sections — positioning, narrative, glossary, FAQ — grounded in the knowledge base.",
    fields: [
      {
        name: "section",
        label: "Section",
        type: "select",
        options: [
          { value: "positioning", label: "Positioning statement" },
          { value: "narrative", label: "Brand narrative" },
          { value: "glossary", label: "Glossary of terms" },
          { value: "faq", label: "FAQ for prospects" },
          { value: "elevator", label: "Elevator pitches (30s / 60s / 2m)" },
        ],
      },
    ],
    buildTask: (v) => `Draft the brand wiki section: ${v.section || "positioning"}.

Cite [Title · p.N] for any claim. Use bold headings; keep paragraphs short.`,
  },
  {
    id: "brand-narrative",
    discipline: "brand-studio",
    module: "brand-narrative",
    eyebrow: "Brand studio",
    title: "Narrative architect",
    intro: "Draft a five-act brand narrative arc grounded in the knowledge base.",
    fields: [
      {
        name: "theme",
        label: "Narrative theme",
        type: "text",
        required: true,
        placeholder: "e.g. Residual value is the missing capital stack input",
        suggestions: [
          "Residual value is the missing capital stack input",
          "Why audit-ready RV ends the spreadsheet era",
          "From depreciation tables to live recovery intelligence",
        ],
      },
      {
        name: "audience",
        label: "Primary audience",
        type: "text",
        required: true,
        placeholder: "e.g. Capital committee members at infra funds",
        suggestions: [
          "Capital committee members at infra funds",
          "Heads of Underwriting at aviation lessors",
          "Recovery leads at asset-backed lenders",
        ],
      },
      {
        name: "proof",
        label: "Proof anchors (optional)",
        type: "textarea",
        rows: 3,
        placeholder: "Key transactions, case studies, or data points to weave in",
      },
    ],
    buildTask: (v) => `Architect a five-act brand narrative arc.

Theme: ${v.theme}
Audience: ${v.audience}
Proof anchors: ${v.proof || "(use knowledge base)"}

Return markdown with sections:
1. Stakes — what is at risk today
2. Shift — what has changed in the market
3. Cost of inaction — quantified consequences of the status quo
4. POV — the inspectable alternative
5. Call — the next concrete step for the audience

Voice: confident, evidence-led, no hype. Every specific claim must cite [Title · p.N] from the knowledge base.`,
  },
  {
    id: "brand-messaging",
    discipline: "brand-studio",
    module: "brand-messaging",
    eyebrow: "Brand studio",
    title: "Messaging matrix",
    intro: "Generate a value-prop / proof / objection-handler matrix per persona, grounded in your knowledge base.",
    fields: [
      {
        name: "personas",
        label: "Personas (one per line)",
        type: "textarea",
        required: true,
        rows: 4,
        placeholder: "CIO infra fund\nHead of Underwriting\nRecovery lead",
      },
      {
        name: "surface",
        label: "Product surface",
        type: "text",
        required: true,
        placeholder: "e.g. Residual value index, recovery pathway, bond sizing",
      },
    ],
    buildTask: (v) => `Build a messaging matrix.

Personas:
${v.personas}

Product surface: ${v.surface}

For each persona, return a markdown table with rows:
- Value proposition (one sentence)
- Proof point (cite [Title · p.N])
- Most likely objection
- Objection handler (cite [Title · p.N])
- CTA (one concrete next step)

Tone: peer-to-peer, evidence-led. No marketing fluff.`,
  },
  {
    id: "pillars",
    discipline: "product-strategy",
    module: "pillars",
    eyebrow: "Product strategy",
    title: "Pillar map",
    intro: "Propose 3–5 content pillars grounded in the knowledge base.",
    fields: [
      {
        name: "horizon",
        label: "Planning horizon",
        type: "text",
        placeholder: "e.g. next 2 quarters",
        suggestions: ["Next quarter", "Next 2 quarters", "Full FY2026", "Pre-conference push (6 weeks)"],
      },
      {
        name: "audience",
        label: "Primary audience (optional)",
        type: "text",
        placeholder: "leave blank to derive from the KB",
      },
    ],
    buildTask: (v) => `Propose 3–5 content pillars.
Horizon: ${v.horizon || "next 2 quarters"}
Audience focus: ${v.audience || "(derive from KB)"}

For each pillar return:
- Title
- Theme
- Focus (1 sentence)
- Primary audience
- Example formats (3 bullets)
- Proof points (cite [Title · p.N])
- Where it ladders to the brand thesis`,
  },
  {
    id: "product-positioning",
    discipline: "product-strategy",
    module: "product-positioning",
    eyebrow: "Product strategy",
    title: "Positioning canvas",
    intro: "Draft an April Dunford-style positioning canvas grounded in the knowledge base.",
    fields: [
      {
        name: "category",
        label: "Market category",
        type: "text",
        required: true,
        placeholder: "e.g. Residual value intelligence layer",
      },
      {
        name: "alternatives",
        label: "Competitive alternatives",
        type: "textarea",
        required: true,
        rows: 3,
        placeholder: "Spreadsheets, IHS, broker desks, internal models",
      },
      {
        name: "icp",
        label: "Ideal customer profile",
        type: "text",
        required: true,
        placeholder: "e.g. Tier-1 infra funds and aviation lessors",
      },
    ],
    buildTask: (v) => `Draft a positioning canvas (April Dunford method).

Category: ${v.category}
Competitive alternatives: ${v.alternatives}
ICP: ${v.icp}

Return markdown with sections:
1. Competitive alternatives (what customers do today)
2. Unique attributes (what only we have)
3. Value (the benefit those attributes enable, quantified where possible)
4. Who it's for best (segments where value peaks)
5. Market category frame (the box we want to be evaluated in)

Every value claim must cite [Title · p.N] from the knowledge base.`,
  },
  {
    id: "product-roadmap",
    discipline: "product-strategy",
    module: "product-roadmap",
    eyebrow: "Product strategy",
    title: "Roadmap narrative",
    intro: "Turn a horizon and themes into a defensible roadmap narrative, grounded in the knowledge base.",
    fields: [
      {
        name: "horizon",
        label: "Horizon",
        type: "select",
        options: [
          { value: "next-quarter", label: "Next quarter" },
          { value: "next-half", label: "Next half" },
          { value: "next-year", label: "Next year" },
          { value: "two-year", label: "Two-year arc" },
        ],
      },
      {
        name: "themes",
        label: "Themes (one per line)",
        type: "textarea",
        required: true,
        rows: 4,
        placeholder: "Bond sizing accuracy\nRecovery pathway depth",
      },
    ],
    buildTask: (v) => `Write a roadmap narrative.

Horizon: ${v.horizon || "next half"}
Themes:
${v.themes}

For each theme return:
- A 2–3 sentence narrative paragraph (why now, who benefits)
- Key assumptions (bulleted)
- Risks / open questions (bulleted)
- Earliest credible proof point we could ship

Ground every claim in [Title · p.N] citations from the knowledge base.`,
  },
  {
    id: "product-launch-brief",
    discipline: "product-strategy",
    module: "product-launch-brief",
    eyebrow: "Product strategy",
    title: "Launch brief",
    intro: "Produce a launch brief — positioning, proof, channels, assets, and success metrics.",
    fields: [
      {
        name: "launch",
        label: "Launch name",
        type: "text",
        required: true,
        placeholder: "e.g. Recovery pathway recommender v1",
      },
      {
        name: "ga",
        label: "GA date",
        type: "text",
        placeholder: "e.g. Sept 16",
      },
      {
        name: "audience",
        label: "Primary audience",
        type: "text",
        required: true,
        placeholder: "e.g. Underwriting teams at aviation lessors",
      },
    ],
    buildTask: (v) => `Draft a launch brief.

Launch: ${v.launch}
GA: ${v.ga || "(TBD)"}
Primary audience: ${v.audience}

Return markdown with sections:
1. One-sentence positioning
2. Proof points (3–5, cited)
3. Audience cuts + key personas
4. Channels (with rationale per channel)
5. Asset checklist (anchor + supporting)
6. Success metrics (leading and lagging)
7. Risks & dependencies

Cite [Title · p.N] for every specific claim from the knowledge base.`,
  },
  {
    id: "ai-brief",
    discipline: "enablement-operations",
    module: "brief",
    eyebrow: "Enablement & operations",
    title: "Content brief",
    intro: "Draft a brand-voice-compliant content brief using pillar, persona, format, and knowledge-base grounding.",
    fields: [
      {
        name: "pillar",
        label: "Content pillar",
        type: "text",
        required: true,
        placeholder: "e.g. Residual value defensibility",
      },
      {
        name: "persona",
        label: "Target persona",
        type: "text",
        required: true,
        placeholder: "e.g. Head of Underwriting at aviation lessor",
      },
      {
        name: "workingTitle",
        label: "Working title",
        type: "text",
        required: true,
        placeholder: "e.g. Bond Sizing and Recovery Assumptions",
      },
      {
        name: "format",
        label: "Format",
        type: "select",
        options: [
          { value: "blog", label: "Blog" },
          { value: "linkedin", label: "LinkedIn post" },
          { value: "one-pager", label: "One-pager" },
          { value: "deck", label: "Deck outline" },
        ],
      },
    ],
    buildTask: (v) => `Draft a content brief.

Pillar: ${v.pillar}
Persona: ${v.persona}
Working title: ${v.workingTitle}
Format: ${v.format || "blog"}

Return markdown with sections:
## TL;DR
## Hook
## Outline
## Proof points (cite [Title · p.N])
## Persona translation
## CTA
## SEO / distribution notes`,
  },
  {
    id: "asset",
    discipline: "enablement-operations",
    module: "asset",
    eyebrow: "Enablement & operations",
    title: "Asset drafter",
    intro: "Draft sales enablement assets grounded in the knowledge base.",
    fields: [
      {
        name: "asset",
        label: "Asset type",
        type: "select",
        options: [
          { value: "one-pager", label: "One-pager" },
          { value: "talk-track", label: "Demo talk track" },
          { value: "discovery", label: "Discovery questions" },
          { value: "email", label: "Outbound email sequence" },
          { value: "objection", label: "Objection handler library" },
        ],
      },
      {
        name: "audience",
        label: "Target audience",
        type: "text",
        required: true,
        placeholder: "e.g. CFO at $1B+ industrial operator",
      },
    ],
    buildTask: (v) => `Draft a ${v.asset || "one-pager"} for: ${v.audience}.

Be specific, opinionated, and use [Title · p.N] citations. Match brand voice exactly.`,
  },
  {
    id: "editorial",
    discipline: "enablement-operations",
    module: "editorial",
    eyebrow: "Enablement & operations",
    title: "Editorial calendar",
    intro: "Generate a dated content slate grounded in the knowledge base.",
    fields: [
      {
        name: "window",
        label: "Window",
        type: "text",
        required: true,
        placeholder: "e.g. 6 weeks starting Aug 5",
      },
      {
        name: "cadence",
        label: "Cadence",
        type: "text",
        required: true,
        placeholder: "e.g. 3 LinkedIn posts/week + 1 long-form/week",
      },
      {
        name: "themes",
        label: "Themes / pillars (optional)",
        type: "text",
        placeholder: "leave blank to derive from KB",
      },
    ],
    buildTask: (v) => `Build an editorial calendar.

Window: ${v.window}
Cadence: ${v.cadence}
Themes: ${v.themes || "(derive from KB)"}

Return a markdown table with columns:
| Date | Format | Pillar | Persona | Hook | Working title | Proof points |

After the table, add a "Sequencing rationale" paragraph explaining how the posts build narrative momentum.`,
  },
  {
    id: "report",
    discipline: "enablement-operations",
    module: "report",
    eyebrow: "Enablement & operations",
    title: "Report drafter",
    intro: "Draft a periodic market report from selected knowledge base documents.",
    fields: [
      {
        name: "period",
        label: "Period",
        type: "text",
        required: true,
        placeholder: "e.g. Q3 2026",
      },
      {
        name: "thesis",
        label: "Thesis to argue",
        type: "textarea",
        rows: 3,
        required: true,
        placeholder: "Central argument the report should defend.",
      },
    ],
    buildTask: (v) => `Draft a market report.
Period: ${v.period}
Thesis: ${v.thesis}

Return:
## Hero stat & label
## Executive summary (3 short paragraphs)
## Section 1 …
## Section 2 …
## Section 3 …
## Implications for operators
## Methodology note

Cite [Title · p.N] for every number.`,
  },
  {
    id: "kpi",
    discipline: "enablement-operations",
    module: "kpi",
    eyebrow: "Enablement & operations",
    title: "KPI framework",
    intro: "Propose a north-star metric plus supporting KPIs with definitions, targets, and owners.",
    fields: [
      {
        name: "horizon",
        label: "Horizon",
        type: "text",
        required: true,
        placeholder: "e.g. FY2026",
      },
      {
        name: "function",
        label: "Function",
        type: "select",
        options: [
          { value: "gtm", label: "GTM (full funnel)" },
          { value: "marketing", label: "Marketing" },
          { value: "sales", label: "Sales" },
          { value: "csm", label: "Customer success" },
          { value: "product", label: "Product-led growth" },
        ],
      },
    ],
    buildTask: (v) => `Propose a KPI framework.
Horizon: ${v.horizon}
Function: ${v.function || "gtm"}

Return:
## North-star metric
Name, definition, formula, target.

## Tier-1 KPIs (3–5)
Per KPI: name, definition, target, owner, source of truth, reporting cadence.

## Tier-2 input metrics (5–8)
Compact table.

## Anti-metrics to ignore
Why each is misleading.`,
  },
  {
    id: "sales-plays",
    discipline: "enablement-operations",
    module: "ops-sales-plays",
    eyebrow: "Enablement & operations",
    title: "Sales play builder",
    intro: "Compose a sales play card — signal, message, asset, CTA, disqualifier.",
    fields: [
      {
        name: "trigger",
        label: "Trigger signal",
        type: "text",
        required: true,
        placeholder: "e.g. New fleet teardown disclosed in 10-Q",
      },
      {
        name: "persona",
        label: "Target persona",
        type: "text",
        required: true,
        placeholder: "e.g. Head of Underwriting at aviation lessor",
      },
      {
        name: "stage",
        label: "Deal stage",
        type: "select",
        options: [
          { value: "prospecting", label: "Prospecting" },
          { value: "discovery", label: "Discovery" },
          { value: "evaluation", label: "Evaluation" },
          { value: "committee", label: "Committee defense" },
          { value: "expansion", label: "Expansion" },
        ],
      },
    ],
    buildTask: (v) => `Build a sales play card.

Trigger: ${v.trigger}
Persona: ${v.persona}
Stage: ${v.stage || "prospecting"}

Return markdown with sections:
1. Signal (how a rep spots this in the wild)
2. Opening message (3 variants — email, LinkedIn DM, call opener)
3. Anchor asset to send (which doc + why)
4. CTA (the single next step we want)
5. Disqualifier (when to walk away)
6. Talk-track for the first 10 minutes of discovery

Cite [Title · p.N] for every claim about market behavior or methodology.`,
  },
  {
    id: "battlecard",
    discipline: "competitive",
    module: "battlecard",
    eyebrow: "Competitive",
    title: "Battlecard composer",
    intro: "Generate a sales battlecard for a competitor or alternative, grounded in the knowledge base.",
    fields: [
      {
        name: "competitor",
        label: "Competitor / alternative",
        type: "text",
        required: true,
        placeholder: "e.g. Profound, internal spreadsheets, status quo",
      },
      {
        name: "context",
        label: "Deal context (optional)",
        type: "textarea",
        rows: 3,
        placeholder: "What the buyer said about them, deal size, decision criteria…",
      },
    ],
    buildTask: (v) => `Draft a sales battlecard for: ${v.competitor}.
Deal context: ${v.context || "(none provided — produce a general-purpose card)"}

Markdown sections:
1. Their positioning (2–3 sentences, neutral)
2. Where they win
3. Where they lose
4. Our counter (3–5 sharp lines)
5. Proof points to cite (with [Title · p.N])
6. Top 3 objections + responses
7. Discovery questions that surface their weaknesses
8. Landmines (things never to say)`,
  },
  {
    id: "competitive-landscape",
    discipline: "competitive",
    module: "competitive-landscape",
    eyebrow: "Competitive",
    title: "Landscape map",
    intro: "Place competitors on a 2x2 with rationale per cell, grounded in the knowledge base.",
    fields: [
      {
        name: "category",
        label: "Category framing",
        type: "text",
        required: true,
        placeholder: "e.g. Residual value intelligence",
      },
      {
        name: "competitors",
        label: "Competitor set (one per line)",
        type: "textarea",
        required: true,
        rows: 5,
        placeholder: "Competitor A\nCompetitor B\nStatus quo",
      },
    ],
    buildTask: (v) => `Build a competitive landscape map.

Category: ${v.category}
Competitors:
${v.competitors}

Return markdown with sections:
1. Choose the two strongest differentiating axes (name them and justify).
2. For each competitor, place them in one of the four quadrants and give a 2-sentence rationale.
3. Where we sit, and why.
4. The narrative we should tell about the empty quadrants.

Cite [Title · p.N] for every behavior or capability claim.`,
  },
  {
    id: "competitive-win-loss",
    discipline: "competitive",
    module: "competitive-win-loss",
    eyebrow: "Competitive",
    title: "Win/loss synthesizer",
    intro: "Synthesize themes, quotes, and counter-moves from deal notes in the knowledge base.",
    fields: [
      {
        name: "segment",
        label: "Segment filter",
        type: "text",
        required: true,
        placeholder: "e.g. Aviation lessors, last 4 quarters",
      },
      {
        name: "lens",
        label: "Analytical lens",
        type: "select",
        options: [
          { value: "themes", label: "Themes — recurring drivers" },
          { value: "competitor", label: "Competitor — who beat us and why" },
          { value: "stage", label: "Stage — where deals are lost" },
          { value: "objection", label: "Objection — most common pushback" },
        ],
      },
    ],
    buildTask: (v) => `Synthesize win/loss intelligence.

Segment: ${v.segment}
Lens: ${v.lens || "themes"}

Return markdown with sections:
1. Top 5 themes (with frequency and supporting [Title · p.N] citations)
2. Representative quotes (with source citations)
3. Recommended counter-moves (asset, message, process change)
4. Open questions to validate in the next 5 deals

Be rigorous: do not invent quotes — pull verbatim from the knowledge base with citations.`,
  },
  {
    id: "persona",
    discipline: "persona-positioning",
    module: "persona",
    eyebrow: "Persona positioning",
    title: "Persona synthesizer",
    intro: "Extract or refine a precise B2B persona from the knowledge base.",
    fields: [
      {
        name: "segment",
        label: "Segment to focus on",
        type: "text",
        required: true,
        placeholder: "e.g. CIO at $5B+ infrastructure fund",
      },
      {
        name: "trigger",
        label: "Top-of-mind trigger (optional)",
        type: "text",
        placeholder: "e.g. portfolio mark-to-market under new accounting rules",
      },
    ],
    buildTask: (v) => `Synthesize a precise persona profile for: ${v.segment}.
Trigger emphasis: ${v.trigger || "(open)"}

Markdown sections (use the exact headings):
## Segment
## Core motivation
## Key triggers (3–5 bullets)
## Top pains (3–5 bullets)
## Value propositions we deliver (3–5)
## Phrases to use
## Phrases to avoid
## 90-second talk track`,
  },
  {
    id: "campaign",
    discipline: "persona-positioning",
    module: "campaign",
    eyebrow: "Persona positioning",
    title: "Campaign architect",
    intro: "Design a multi-channel GTM campaign grounded in the knowledge base.",
    fields: [
      {
        name: "objective",
        label: "Campaign objective",
        type: "text",
        required: true,
        placeholder: "e.g. Drive qualified pipeline from Tier-1 asset managers",
      },
      {
        name: "audience",
        label: "Target audience",
        type: "text",
        required: true,
        placeholder: "e.g. CIOs and portfolio managers at infra funds",
      },
      {
        name: "window",
        label: "Timeline / window",
        type: "text",
        placeholder: "e.g. 6 weeks",
      },
      {
        name: "channels",
        label: "Preferred channels (optional)",
        type: "text",
        placeholder: "LinkedIn, blog, email, paid, events…",
      },
    ],
    buildTask: (v) => `Design an end-to-end GTM campaign.

Objective: ${v.objective}
Audience: ${v.audience}
Timeline: ${v.window || "(unspecified)"}
Preferred channels: ${v.channels || "(open)"}

Return a markdown plan with sections:
1. Strategic thesis (3 bullets)
2. Audience cut + entry points
3. LinkedIn cadence (per-week post outlines, hooks, formats)
4. Long-form (blog/whitepaper series — titles + angles)
5. Email sequence (subject lines + body outlines for 4–6 touches)
6. Paid hooks (ad concepts + targeting)
7. Sales motion (BDR talk track, discovery questions, objection handlers)
8. Success metrics & measurement plan

Every specific claim must cite [Title · p.N] from the knowledge base.`,
  },
  {
    id: "persona-journey",
    discipline: "persona-positioning",
    module: "persona-journey",
    eyebrow: "Persona positioning",
    title: "Buyer journey mapper",
    intro: "Map a buyer journey — jobs, anxieties, content needs — per stage.",
    fields: [
      {
        name: "persona",
        label: "Persona",
        type: "text",
        required: true,
        placeholder: "e.g. Head of Underwriting at aviation lessor",
      },
      {
        name: "context",
        label: "Trigger context (optional)",
        type: "text",
        placeholder: "e.g. Refinancing a $1B aviation portfolio",
      },
    ],
    buildTask: (v) => `Map the buyer journey.

Persona: ${v.persona}
Context: ${v.context || "(general)"}

For each stage — Aware, Consider, Decide, Adopt — return:
- Jobs the persona is trying to get done
- Anxieties / blockers
- Content needs (format and angle)
- Internal stakeholders they bring in
- Best moment-of-truth

Ground every behavioral claim with [Title · p.N] citations from the knowledge base.`,
  },
  {
    id: "persona-objections",
    discipline: "persona-positioning",
    module: "persona-objections",
    eyebrow: "Persona positioning",
    title: "Objection library",
    intro: "Generate a ranked objection library per persona with grounded counters and citations.",
    fields: [
      {
        name: "persona",
        label: "Persona",
        type: "text",
        required: true,
        placeholder: "e.g. Capital committee chair",
      },
      {
        name: "surface",
        label: "Product surface",
        type: "text",
        required: true,
        placeholder: "e.g. Residual value index, bond sizing module",
      },
    ],
    buildTask: (v) => `Build an objection library.

Persona: ${v.persona}
Surface: ${v.surface}

Return a ranked markdown list (most → least common) of 8–12 objections. For each:
- Verbatim objection (how the persona would say it)
- Why they say it (underlying concern)
- Counter (1–2 sentence response)
- Evidence to attach (cite [Title · p.N])
- Escalation move if the counter doesn't land

Never invent objections we have no signal for; only include those grounded in the knowledge base.`,
  },
];

export function getUseCasesForDiscipline(discipline: DisciplineId) {
  return USE_CASES.filter((u) => u.discipline === discipline);
}

export function getUseCase(id: string) {
  return USE_CASES.find((u) => u.id === id);
}
