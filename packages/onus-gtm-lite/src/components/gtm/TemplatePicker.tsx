import type { ClusterTemplate } from "@/config/cluster-workspaces";

export function TemplatePicker({
  templates,
  activeId,
  onChange,
}: {
  templates: ClusterTemplate[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="num text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
        2 · Choose artifact template
      </div>
      <div className="grid gap-2">
        {templates.map((t) => {
          const on = activeId === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={`text-left border px-3 py-2 transition-colors w-full ${
                on
                  ? "border-[var(--studio-accent)] bg-[color-mix(in_oklab,var(--studio-accent)_8%,transparent)]"
                  : "border-border hover:border-muted-foreground/40"
              }`}
            >
              <div className="text-xs font-medium">{t.label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{t.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
