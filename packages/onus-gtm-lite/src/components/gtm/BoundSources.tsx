import type { KbDocument } from "@/lib/kb/types";

export function BoundSources({
  docs,
  selectedIds,
  hint,
}: {
  docs: KbDocument[];
  selectedIds: Set<string>;
  hint?: string;
}) {
  const bound = docs.filter((d) => selectedIds.has(d.id));

  if (bound.length === 0) {
    return (
      <div className="text-[11px] px-2 py-1.5 border border-dashed border-border text-muted-foreground">
        {hint ?? "Pick a template to bind knowledge base sources."}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="num text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        Grounded sources · {bound.length}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {bound.map((d) => (
          <span
            key={d.id}
            className="text-[10px] px-2 py-1 border border-[var(--studio-accent)] text-foreground"
          >
            {d.title}
            <span className="num text-muted-foreground ml-1">· {d.page_count ?? "?"}p</span>
          </span>
        ))}
      </div>
    </div>
  );
}
