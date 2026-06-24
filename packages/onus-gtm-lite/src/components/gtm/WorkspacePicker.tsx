import type { WorkspaceId } from "@/config/cluster-workspaces";
import { WORKSPACES } from "@/config/cluster-workspaces";

export function WorkspacePicker({
  active,
  onChange,
}: {
  active: WorkspaceId;
  onChange: (id: WorkspaceId) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="num text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
        1 · Choose product workspace
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {WORKSPACES.map((ws) => {
          const on = active === ws.id;
          return (
            <button
              key={ws.id}
              type="button"
              onClick={() => onChange(ws.id)}
              className={`text-left border px-3 py-2 transition-colors ${
                on
                  ? "border-[var(--studio-accent)] bg-[color-mix(in_oklab,var(--studio-accent)_10%,transparent)]"
                  : "border-border hover:border-muted-foreground/40"
              }`}
            >
              <div className="text-xs font-medium">{ws.label}</div>
              <div className="text-[10px] text-muted-foreground mt-1 leading-snug">{ws.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
