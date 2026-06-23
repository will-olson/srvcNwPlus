export type DisciplineId =
  | "brand-studio"
  | "product-strategy"
  | "enablement-operations"
  | "competitive"
  | "persona-positioning";

export type AccentKey = "a" | "b" | "c" | "d" | "e";

export const ACCENT_VAR: Record<AccentKey, string> = {
  a: "var(--accent-a)",
  b: "var(--accent-b)",
  c: "var(--accent-c)",
  d: "var(--accent-d)",
  e: "var(--accent-e)",
};

export const DISCIPLINES: Array<{
  id: DisciplineId;
  label: string;
  tag: string;
  accent: AccentKey;
}> = [
  { id: "brand-studio", label: "Brand studio", tag: "01", accent: "a" },
  { id: "product-strategy", label: "Product strategy", tag: "02", accent: "b" },
  { id: "enablement-operations", label: "Enablement & operations", tag: "03", accent: "c" },
  { id: "competitive", label: "Competitive", tag: "04", accent: "d" },
  { id: "persona-positioning", label: "Persona positioning", tag: "05", accent: "e" },
];

export function getDiscipline(id: DisciplineId) {
  const d = DISCIPLINES.find((x) => x.id === id);
  if (!d) throw new Error(`Unknown discipline: ${id}`);
  return d;
}
