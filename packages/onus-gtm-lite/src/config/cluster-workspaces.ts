import type { DisciplineId } from "./disciplines";
import type { GeneratorField } from "./use-cases";

export type WorkspaceId = "echelon" | "profound" | "monte-carlo" | "competitive" | "uploads";

export const SEED_FILES = {
  echelonPersonas: "echelon-personas.md",
  echelonVerticals: "echelon-verticals.md",
  echelonTechnical: "echelon-technical-use-cases.md",
  echelonCompetitive: "echelon-competitive-positioning.md",
  profoundGtm: "profound-gtm-strategy.md",
  monteCarloCompetitive: "monte-carlo-competitive-analysis.md",
  monteCarloIndustries: "monte-carlo-industries.md",
} as const;

/** Seed docs allowed in cross-cluster competitive templates */
export const COMPETITIVE_CROSS_CLUSTER_FILENAMES: string[] = [
  SEED_FILES.echelonCompetitive,
  SEED_FILES.monteCarloCompetitive,
  SEED_FILES.profoundGtm,
];

export const COMPETITIVE_MODULES = new Set([
  "battlecard",
  "competitive-landscape",
  "competitive-win-loss",
]);

export type ClusterTemplate = {
  id: string;
  workspace: WorkspaceId;
  label: string;
  description: string;
  useCaseId: string;
  discipline: DisciplineId;
  documentFilenames?: string[];
  defaultValues: Record<string, string>;
  fields?: GeneratorField[];
};

export const WORKSPACES: Array<{
  id: WorkspaceId;
  label: string;
  description: string;
  discipline: DisciplineId;
}> = [
  {
    id: "echelon",
    label: "Echelon",
    description: "ServiceNow delivery — personas, verticals, technical use cases",
    discipline: "persona-positioning",
  },
  {
    id: "profound",
    label: "Profound",
    description: "AI search intelligence — outbound, objections, POV",
    discipline: "enablement-operations",
  },
  {
    id: "monte-carlo",
    label: "Monte Carlo",
    description: "Data & agent trust — platform battlecards, vertical pitches",
    discipline: "product-strategy",
  },
  {
    id: "competitive",
    label: "Competitive",
    description: "Cross-product landscape, battlecards, win/loss (multi-source)",
    discipline: "competitive",
  },
  {
    id: "uploads",
    label: "My Uploads",
    description: "Your documents — same artifact shapes, upload-only grounding",
    discipline: "enablement-operations",
  },
];

const echelonPersonaOptions = [
  { value: "CIO / CTO / Chief Digital Officer", label: "CIO / CTO / Chief Digital Officer" },
  { value: "VP Enterprise Applications / ServiceNow Platform Owner", label: "VP Enterprise Applications / ServiceNow Platform Owner" },
  { value: "ServiceNow Platform Owner / Director", label: "ServiceNow Platform Owner / Director" },
  { value: "ServiceNow Architect / CMA", label: "ServiceNow Architect / CMA" },
  { value: "MSP / SI practice leader", label: "MSP / SI practice leader" },
];

const echelonPainOptions = [
  { value: "Backlog-constrained platform team", label: "Backlog-constrained platform team" },
  { value: "MSP/SI-dependent enterprise", label: "MSP/SI-dependent enterprise" },
  { value: "Modernization and migration program", label: "Modernization and migration program" },
  { value: "Governance and quality-constrained team", label: "Governance and quality-constrained team" },
  { value: "AI-transformation executive pressure", label: "AI-transformation executive pressure" },
];

const echelonVerticalOptions = [
  { value: "Healthcare", label: "Healthcare" },
  { value: "Banking / financial services", label: "Banking / financial services" },
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Telecom", label: "Telecom" },
  { value: "Public sector", label: "Public sector" },
];

const echelonTechnicalOptions = [
  { value: "req-translation", label: "Requirements translation" },
  { value: "atf", label: "ATF / test generation" },
  { value: "migration", label: "Legacy migration" },
  { value: "update-set", label: "Update-set review" },
  { value: "cmdb", label: "CMDB / governance cleanup" },
];

const echelonIncumbentOptions = [
  { value: "msp", label: "Traditional MSP" },
  { value: "si", label: "Global SI (Accenture / Deloitte)" },
  { value: "internal", label: "Internal team capacity crunch" },
  { value: "build-agent", label: "ServiceNow Build Agent / Now Assist" },
];

const echelonCompetitorOptions = [
  { value: "now-assist", label: "ServiceNow Now Assist / Build Agent" },
  { value: "devin", label: "Devin / Cursor / Copilot" },
  { value: "si", label: "Accenture / Deloitte SI delivery" },
  { value: "msp-status-quo", label: "Status quo MSP" },
];

const profoundVerticalOptions = [
  { value: "b2b-saas", label: "B2B SaaS" },
  { value: "financial-services", label: "Financial services" },
  { value: "retail", label: "Retail / ecommerce" },
  { value: "travel", label: "Travel" },
  { value: "healthcare", label: "Healthcare" },
];

const profoundObjectionOptions = [
  { value: "commoditization", label: "Rank tracker commoditization" },
  { value: "seo-suite", label: "SEO suite consolidation (Ahrefs/Semrush)" },
  { value: "roi", label: "ROI / proof requirements" },
  { value: "procurement", label: "Procurement / security" },
  { value: "build-vs-buy", label: "Build vs buy" },
];

const profoundStageOptions = [
  { value: "discovery", label: "Discovery" },
  { value: "evaluation", label: "Evaluation" },
  { value: "procurement", label: "Procurement" },
  { value: "pov", label: "Pilot / POV" },
];

const profoundCompetitorOptions = [
  { value: "ahrefs-semrush", label: "Ahrefs / Semrush" },
  { value: "peec", label: "Peec / Evertune" },
  { value: "airops", label: "AirOps / Jasper" },
  { value: "internal-seo", label: "Internal SEO team" },
];

const monteCarloCompetitorOptions = [
  { value: "databricks", label: "Databricks" },
  { value: "snowflake", label: "Snowflake" },
  { value: "datadog", label: "Datadog" },
  { value: "salesforce", label: "Salesforce Agentforce" },
  { value: "notion", label: "Notion" },
];

const monteCarloVerticalOptions = [
  { value: "financial-services", label: "Financial services" },
  { value: "insurance", label: "Insurance" },
  { value: "healthcare", label: "Healthcare / life sciences" },
  { value: "retail", label: "Retail / ecommerce" },
  { value: "saas", label: "SaaS / B2B technology" },
  { value: "telecom", label: "Telecom" },
];

const monteCarloWedgeOptions = [
  { value: "data-vs-agent", label: "Data failure vs agent failure" },
  { value: "trust-fabric", label: "Neutral trust fabric" },
  { value: "lakehouse", label: "Lakehouse-native governance counter" },
];

const monteCarloPersonaOptions = [
  { value: "cdo", label: "CDO / Chief Analytics Officer" },
  { value: "head-data", label: "Head of Data / Data Platform" },
  { value: "ai-lead", label: "AI / GenAI lead" },
  { value: "compliance", label: "Compliance / risk" },
];

const crossCompetitorOptions = [
  { value: "servicenow-native", label: "ServiceNow native AI" },
  { value: "databricks", label: "Databricks lakehouse" },
  { value: "datadog", label: "Datadog observability" },
  { value: "ahrefs", label: "Ahrefs / Semrush SEO suite" },
];

const lossReasonOptions = [
  { value: "native-platform", label: "Native platform incumbent" },
  { value: "si-msp", label: "SI / MSP incumbent" },
  { value: "diy", label: "Point-tool DIY" },
];

export const CLUSTER_TEMPLATES: ClusterTemplate[] = [
  // —— Echelon ——
  {
    id: "echelon-persona",
    workspace: "echelon",
    label: "Buyer persona brief",
    description: "ICP persona profile from Document A — motivations, pains, talk track",
    useCaseId: "persona",
    discipline: "persona-positioning",
    documentFilenames: [SEED_FILES.echelonPersonas],
    defaultValues: { segment: "VP Enterprise Applications / ServiceNow Platform Owner", trigger: "" },
    fields: [
      {
        name: "segment",
        label: "Target persona",
        type: "select",
        required: true,
        options: echelonPersonaOptions,
      },
      {
        name: "trigger",
        label: "Acquisition trigger (optional)",
        type: "text",
        placeholder: "e.g. six-month ServiceNow backlog, MSP renewal",
      },
    ],
  },
  {
    id: "echelon-pain-objections",
    workspace: "echelon",
    label: "Pain-segment talk track",
    description: "Objection library keyed to Echelon pain segments from Document A",
    useCaseId: "persona-objections",
    discipline: "persona-positioning",
    documentFilenames: [SEED_FILES.echelonPersonas],
    defaultValues: {
      persona: "ServiceNow Platform Owner",
      surface: "Backlog-constrained platform team",
    },
    fields: [
      {
        name: "persona",
        label: "Pain segment",
        type: "select",
        required: true,
        options: echelonPainOptions,
      },
      {
        name: "surface",
        label: "Delivery surface",
        type: "select",
        required: true,
        options: [
          { value: "catalog-backlog", label: "Service catalog / backlog clearing" },
          { value: "msp-displacement", label: "MSP displacement" },
          { value: "migration", label: "Legacy migration" },
          { value: "governance", label: "Governance / ATF / documentation" },
        ],
      },
    ],
  },
  {
    id: "echelon-vertical-campaign",
    workspace: "echelon",
    label: "Vertical GTM campaign",
    description: "Industry campaign from Document B — vertical narratives and plays",
    useCaseId: "campaign",
    discipline: "persona-positioning",
    documentFilenames: [SEED_FILES.echelonVerticals],
    defaultValues: {
      objective: "Generate qualified pipeline for ServiceNow modernization",
      audience: "Healthcare IT and ServiceNow platform leaders",
      window: "6 weeks",
      channels: "LinkedIn, email, webinar",
    },
    fields: [
      {
        name: "audience",
        label: "Target vertical",
        type: "select",
        required: true,
        options: echelonVerticalOptions,
      },
      {
        name: "objective",
        label: "Campaign objective",
        type: "text",
        required: true,
        placeholder: "e.g. Pipeline for healthcare vertical modernization",
      },
      { name: "window", label: "Timeline", type: "text", placeholder: "6 weeks" },
      {
        name: "channels",
        label: "Channels",
        type: "text",
        placeholder: "LinkedIn, email, webinar",
      },
    ],
  },
  {
    id: "echelon-technical-discovery",
    workspace: "echelon",
    label: "Technical discovery guide",
    description: "Technical enablement asset from Document C — discovery and scoping",
    useCaseId: "asset",
    discipline: "enablement-operations",
    documentFilenames: [SEED_FILES.echelonTechnical],
    defaultValues: { asset: "discovery", audience: "Requirements translation" },
    fields: [
      {
        name: "audience",
        label: "Technical use case",
        type: "select",
        required: true,
        options: echelonTechnicalOptions,
      },
      {
        name: "asset",
        label: "Asset format",
        type: "select",
        options: [
          { value: "discovery", label: "Discovery questions" },
          { value: "talk-track", label: "Demo talk track" },
          { value: "one-pager", label: "Technical one-pager" },
        ],
      },
    ],
  },
  {
    id: "echelon-msp-play",
    workspace: "echelon",
    label: "MSP displacement narrative",
    description: "Sales play against MSP/SI incumbents from competitive positioning doc",
    useCaseId: "sales-plays",
    discipline: "enablement-operations",
    documentFilenames: [SEED_FILES.echelonCompetitive],
    defaultValues: {
      trigger: "MSP renewal with visible backlog and SOW cost pressure",
      persona: "VP Enterprise Applications",
      stage: "evaluation",
    },
    fields: [
      {
        name: "trigger",
        label: "Incumbent model",
        type: "select",
        required: true,
        options: echelonIncumbentOptions,
      },
      {
        name: "persona",
        label: "Target persona",
        type: "select",
        required: true,
        options: echelonPersonaOptions,
      },
      {
        name: "stage",
        label: "Deal stage",
        type: "select",
        options: [
          { value: "prospecting", label: "Prospecting" },
          { value: "discovery", label: "Discovery" },
          { value: "evaluation", label: "Evaluation" },
        ],
      },
    ],
  },
  {
    id: "echelon-servicenow-battlecard",
    workspace: "echelon",
    label: "ServiceNow native battlecard",
    description: "Counter-positioning vs ServiceNow native AI from Echelon competitive doc",
    useCaseId: "battlecard",
    discipline: "competitive",
    documentFilenames: [SEED_FILES.echelonCompetitive],
    defaultValues: { competitor: "ServiceNow Now Assist / Build Agent", context: "" },
    fields: [
      {
        name: "competitor",
        label: "Competitor / alternative",
        type: "select",
        required: true,
        options: echelonCompetitorOptions,
      },
      {
        name: "context",
        label: "Deal context (optional)",
        type: "textarea",
        rows: 2,
        placeholder: "Buyer evaluation criteria, incumbent tools…",
      },
    ],
  },
  // —— Profound ——
  {
    id: "profound-outbound",
    workspace: "profound",
    label: "Vertical outbound sequence",
    description: "Multi-touch outbound from Profound GTM playbook Section 5",
    useCaseId: "campaign",
    discipline: "persona-positioning",
    documentFilenames: [SEED_FILES.profoundGtm],
    defaultValues: {
      objective: "Book discovery meetings with marketing leaders evaluating AEO",
      audience: "B2B SaaS",
      window: "4 weeks",
      channels: "LinkedIn, email",
    },
    fields: [
      {
        name: "audience",
        label: "Target vertical",
        type: "select",
        required: true,
        options: profoundVerticalOptions,
      },
      {
        name: "objective",
        label: "Outbound objective",
        type: "text",
        required: true,
      },
      { name: "window", label: "Timeline", type: "text", placeholder: "4 weeks" },
      { name: "channels", label: "Channels", type: "text", placeholder: "LinkedIn, email" },
    ],
  },
  {
    id: "profound-objections",
    workspace: "profound",
    label: "Mid-funnel objection handler",
    description: "Objection responses from Profound playbook Section 6",
    useCaseId: "persona-objections",
    discipline: "persona-positioning",
    documentFilenames: [SEED_FILES.profoundGtm],
    defaultValues: {
      persona: "VP Marketing / Growth",
      surface: "Rank tracker commoditization",
    },
    fields: [
      {
        name: "persona",
        label: "Buyer persona",
        type: "select",
        required: true,
        options: [
          { value: "vp-marketing", label: "VP Marketing / Growth" },
          { value: "seo-lead", label: "SEO / AEO lead" },
          { value: "digital", label: "Head of Digital / Content" },
          { value: "procurement", label: "Procurement / security" },
        ],
      },
      {
        name: "surface",
        label: "Objection theme",
        type: "select",
        required: true,
        options: profoundObjectionOptions,
      },
    ],
  },
  {
    id: "profound-pov",
    workspace: "profound",
    label: "POV / business case",
    description: "Proof-of-value narrative from Profound playbook Section 7",
    useCaseId: "report",
    discipline: "enablement-operations",
    documentFilenames: [SEED_FILES.profoundGtm],
    defaultValues: {
      period: "Pilot / POV",
      thesis: "AI discovery is an unowned revenue surface — Profound provides measurement and activation",
    },
    fields: [
      {
        name: "period",
        label: "Buyer stage",
        type: "select",
        required: true,
        options: profoundStageOptions,
      },
      {
        name: "thesis",
        label: "Business case thesis",
        type: "textarea",
        rows: 3,
        required: true,
      },
    ],
  },
  {
    id: "profound-battlecard",
    workspace: "profound",
    label: "SEO-suite battlecard",
    description: "Battlecard vs SEO suites and point trackers from Section 8",
    useCaseId: "battlecard",
    discipline: "competitive",
    documentFilenames: [SEED_FILES.profoundGtm],
    defaultValues: { competitor: "Ahrefs / Semrush", context: "" },
    fields: [
      {
        name: "competitor",
        label: "Competitor",
        type: "select",
        required: true,
        options: profoundCompetitorOptions,
      },
      { name: "context", label: "Deal context (optional)", type: "textarea", rows: 2 },
    ],
  },
  // —— Monte Carlo ——
  {
    id: "monte-carlo-battlecard",
    workspace: "monte-carlo",
    label: "Platform battlecard",
    description: "Counter-positioning vs data/AI platforms from competitive analysis",
    useCaseId: "battlecard",
    discipline: "competitive",
    documentFilenames: [SEED_FILES.monteCarloCompetitive],
    defaultValues: { competitor: "Databricks", context: "" },
    fields: [
      {
        name: "competitor",
        label: "Platform competitor",
        type: "select",
        required: true,
        options: monteCarloCompetitorOptions,
      },
      { name: "context", label: "Deal context (optional)", type: "textarea", rows: 2 },
    ],
  },
  {
    id: "monte-carlo-vertical-pitch",
    workspace: "monte-carlo",
    label: "Vertical trust pitch",
    description: "Industry-specific value story from industry strategy doc",
    useCaseId: "sales-plays",
    discipline: "enablement-operations",
    documentFilenames: [SEED_FILES.monteCarloIndustries],
    defaultValues: {
      trigger: "Data incident affecting executive reporting",
      persona: "CDO / Chief Analytics Officer",
      stage: "discovery",
    },
    fields: [
      {
        name: "trigger",
        label: "Target vertical",
        type: "select",
        required: true,
        options: monteCarloVerticalOptions,
      },
      {
        name: "persona",
        label: "Primary persona",
        type: "select",
        required: true,
        options: monteCarloPersonaOptions,
      },
      {
        name: "stage",
        label: "Deal stage",
        type: "select",
        options: [
          { value: "discovery", label: "Discovery" },
          { value: "evaluation", label: "Evaluation" },
        ],
      },
    ],
  },
  {
    id: "monte-carlo-agent-narrative",
    workspace: "monte-carlo",
    label: "Agent observability narrative",
    description: "Product positioning for agent trust wedge from competitive analysis",
    useCaseId: "product-positioning",
    discipline: "product-strategy",
    documentFilenames: [SEED_FILES.monteCarloCompetitive],
    defaultValues: {
      category: "Independent trust fabric for production AI agents",
      alternatives: "Databricks Unity Catalog, Datadog, Salesforce Agentforce",
      icp: "Enterprise data platform and AI operations leaders",
    },
    fields: [
      {
        name: "category",
        label: "Positioning wedge",
        type: "select",
        required: true,
        options: monteCarloWedgeOptions,
      },
      {
        name: "alternatives",
        label: "Primary alternative",
        type: "select",
        required: true,
        options: monteCarloCompetitorOptions,
      },
      {
        name: "icp",
        label: "ICP focus",
        type: "select",
        required: true,
        options: monteCarloPersonaOptions,
      },
    ],
  },
  {
    id: "monte-carlo-industry-report",
    workspace: "monte-carlo",
    label: "Industry ROI brief",
    description: "Vertical ROI narrative from industry strategy doc",
    useCaseId: "report",
    discipline: "enablement-operations",
    documentFilenames: [SEED_FILES.monteCarloIndustries],
    defaultValues: {
      period: "Financial services",
      thesis: "Bad data becomes a risk, compliance, or revenue event — Monte Carlo provides enterprise data reliability",
    },
    fields: [
      {
        name: "period",
        label: "Target vertical",
        type: "select",
        required: true,
        options: monteCarloVerticalOptions,
      },
      {
        name: "thesis",
        label: "ROI thesis",
        type: "textarea",
        rows: 2,
        required: true,
        placeholder: "Central argument for this vertical",
      },
    ],
  },
  // —— Competitive (cross-cluster) ——
  {
    id: "competitive-landscape",
    workspace: "competitive",
    label: "Cross-vendor landscape",
    description: "2x2 landscape across Echelon and Monte Carlo competitive intel",
    useCaseId: "competitive-landscape",
    discipline: "competitive",
    documentFilenames: [SEED_FILES.echelonCompetitive, SEED_FILES.monteCarloCompetitive],
    defaultValues: {
      category: "Enterprise AI delivery and data trust platforms",
      competitors: "ServiceNow native AI\nDatabricks\nDatadog\nGlobal SI delivery",
    },
    fields: [
      {
        name: "category",
        label: "Category framing",
        type: "text",
        required: true,
        placeholder: "Enterprise AI delivery and data trust",
      },
      {
        name: "competitors",
        label: "Competitor set (one per line)",
        type: "textarea",
        required: true,
        rows: 4,
      },
    ],
  },
  {
    id: "competitive-unified-battlecard",
    workspace: "competitive",
    label: "Unified battlecard",
    description: "Battlecard drawing from multiple competitive seed docs",
    useCaseId: "battlecard",
    discipline: "competitive",
    documentFilenames: [SEED_FILES.echelonCompetitive, SEED_FILES.monteCarloCompetitive],
    defaultValues: { competitor: "ServiceNow native AI", context: "" },
    fields: [
      {
        name: "competitor",
        label: "Competitor archetype",
        type: "select",
        required: true,
        options: crossCompetitorOptions,
      },
      { name: "context", label: "Deal context (optional)", type: "textarea", rows: 2 },
    ],
  },
  {
    id: "competitive-win-loss",
    workspace: "competitive",
    label: "Win/loss synthesis",
    description: "Cross-product win/loss themes from competitive positioning docs",
    useCaseId: "competitive-win-loss",
    discipline: "competitive",
    documentFilenames: [
      SEED_FILES.echelonCompetitive,
      SEED_FILES.monteCarloCompetitive,
      SEED_FILES.profoundGtm,
    ],
    defaultValues: {
      segment: "Enterprise platform evaluations — last 4 quarters",
      lens: "competitor",
    },
    fields: [
      {
        name: "segment",
        label: "Segment filter",
        type: "text",
        required: true,
        placeholder: "e.g. ServiceNow platform deals, last 2 quarters",
      },
      {
        name: "lens",
        label: "Loss driver",
        type: "select",
        required: true,
        options: lossReasonOptions,
      },
    ],
  },
  // —— Uploads (same shapes) ——
  {
    id: "upload-persona",
    workspace: "uploads",
    label: "Persona brief",
    description: "Persona profile grounded in your uploaded documents",
    useCaseId: "persona",
    discipline: "persona-positioning",
    defaultValues: { segment: "", trigger: "" },
    fields: [
      {
        name: "segment",
        label: "Target segment / persona",
        type: "text",
        required: true,
        placeholder: "e.g. VP Platform at enterprise SaaS",
      },
      {
        name: "trigger",
        label: "Top trigger (optional)",
        type: "text",
        placeholder: "What prompted them to look now?",
      },
    ],
  },
  {
    id: "upload-campaign",
    workspace: "uploads",
    label: "GTM campaign",
    description: "Multi-channel campaign from your uploaded playbooks",
    useCaseId: "campaign",
    discipline: "persona-positioning",
    defaultValues: { objective: "", audience: "", window: "6 weeks", channels: "" },
    fields: [
      { name: "objective", label: "Campaign objective", type: "text", required: true },
      { name: "audience", label: "Target audience", type: "text", required: true },
      { name: "window", label: "Timeline", type: "text" },
      { name: "channels", label: "Channels", type: "text" },
    ],
  },
  {
    id: "upload-battlecard",
    workspace: "uploads",
    label: "Battlecard",
    description: "Competitive battlecard from your uploaded intel",
    useCaseId: "battlecard",
    discipline: "competitive",
    defaultValues: { competitor: "", context: "" },
    fields: [
      { name: "competitor", label: "Competitor", type: "text", required: true },
      { name: "context", label: "Deal context (optional)", type: "textarea", rows: 2 },
    ],
  },
  {
    id: "upload-asset",
    workspace: "uploads",
    label: "Enablement asset",
    description: "Discovery guide, talk track, or one-pager from uploads",
    useCaseId: "asset",
    discipline: "enablement-operations",
    defaultValues: { asset: "discovery", audience: "" },
    fields: [
      {
        name: "asset",
        label: "Asset type",
        type: "select",
        options: [
          { value: "one-pager", label: "One-pager" },
          { value: "talk-track", label: "Talk track" },
          { value: "discovery", label: "Discovery questions" },
        ],
      },
      { name: "audience", label: "Target audience", type: "text", required: true },
    ],
  },
  {
    id: "upload-report",
    workspace: "uploads",
    label: "Market / POV report",
    description: "Structured report from your uploaded research",
    useCaseId: "report",
    discipline: "enablement-operations",
    defaultValues: { period: "Current period", thesis: "" },
    fields: [
      { name: "period", label: "Period / scope", type: "text", required: true },
      { name: "thesis", label: "Central thesis", type: "textarea", rows: 3, required: true },
    ],
  },
];

export function getWorkspace(id: WorkspaceId) {
  const ws = WORKSPACES.find((w) => w.id === id);
  if (!ws) throw new Error(`Unknown workspace: ${id}`);
  return ws;
}

export function getTemplatesForWorkspace(workspace: WorkspaceId): ClusterTemplate[] {
  return CLUSTER_TEMPLATES.filter((t) => t.workspace === workspace);
}

export function getTemplate(templateId: string): ClusterTemplate | undefined {
  return CLUSTER_TEMPLATES.find((t) => t.id === templateId);
}

export function getDefaultTemplateId(workspace: WorkspaceId): string {
  return getTemplatesForWorkspace(workspace)[0]?.id ?? "echelon-persona";
}

export function resolveTemplateDocumentIds(
  template: ClusterTemplate,
  docs: Array<{ id: string; filename: string }>,
): string[] {
  if (!template.documentFilenames?.length) return [];
  const names = new Set(template.documentFilenames);
  return docs.filter((d) => names.has(d.filename)).map((d) => d.id);
}

export const CLUSTER_LABELS: Record<string, string> = {
  echelon: "Echelon",
  profound: "Profound",
  "monte-carlo": "Monte Carlo",
};

export const CLUSTER_ORDER = ["echelon", "profound", "monte-carlo"] as const;
