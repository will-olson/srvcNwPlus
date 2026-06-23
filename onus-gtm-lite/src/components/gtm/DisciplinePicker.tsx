import { ACCENT_VAR, DISCIPLINES, type DisciplineId } from "@/config/disciplines";

export function DisciplinePicker({
  active,
  onChange,
}: {
  active: DisciplineId;
  onChange: (id: DisciplineId) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1" role="tablist">
      {DISCIPLINES.map((d) => {
        const on = d.id === active;
        return (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(d.id)}
            style={on ? { borderColor: ACCENT_VAR[d.accent], color: ACCENT_VAR[d.accent] } : undefined}
            className={`px-2 py-1 text-[10px] uppercase tracking-[0.18em] num border ${
              on ? "bg-surface/60" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {d.tag} · {d.label}
          </button>
        );
      })}
    </div>
  );
}
