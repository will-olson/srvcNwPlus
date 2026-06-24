import type { DisciplineId } from "@/config/disciplines";

export type NewsPreset = {
  id: string;
  label: string;
  query: string;
  disciplines?: DisciplineId[];
};

export const NEWS_PRESETS: NewsPreset[] = [
  {
    id: "servicenow-ai",
    label: "ServiceNow AI platform",
    query: "ServiceNow AI platform enterprise",
    disciplines: ["competitive"],
  },
  {
    id: "build-agent",
    label: "Build Agent workflows",
    query: "ServiceNow Build Agent workflow automation",
    disciplines: ["product-strategy"],
  },
  {
    id: "enterprise-it",
    label: "Enterprise IT automation",
    query: "enterprise IT workflow automation platform",
    disciplines: ["product-strategy", "enablement-operations"],
  },
  {
    id: "competitive-moves",
    label: "Competitive platform moves",
    query: "ServiceNow Salesforce Workday platform competition",
    disciplines: ["competitive"],
  },
];

export function getNewsPresetsForDiscipline(discipline: DisciplineId): NewsPreset[] {
  return NEWS_PRESETS.filter(
    (p) => !p.disciplines?.length || p.disciplines.includes(discipline),
  );
}
