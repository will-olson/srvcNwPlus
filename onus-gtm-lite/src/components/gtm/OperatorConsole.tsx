import { useMemo, useState } from "react";

export function OperatorConsole({
  selectedCount,
  fieldCount,
  filledCount,
  pending,
  model,
  blocks,
  kbChars,
}: {
  selectedCount: number;
  fieldCount: number;
  filledCount: number;
  pending?: boolean;
  model?: string;
  blocks?: number;
  kbChars?: number;
}) {
  const [open, setOpen] = useState(true);
  const events = useMemo(() => {
    const now = new Date();
    const stamp = (offset: number) =>
      new Date(now.getTime() - offset * 1000).toISOString().slice(11, 19) + "Z";
    const out: Array<{ t: string; k: string; v: string }> = [
      { t: stamp(20), k: "sources.selected", v: `n=${selectedCount}` },
      {
        t: stamp(14),
        k: "prompt.compiled",
        v: `fields=${fieldCount} filled=${filledCount}`,
      },
    ];
    if (pending) out.push({ t: stamp(2), k: "model.invoked", v: "pending…" });
    if (model) {
      out.push({ t: stamp(1), k: "model.invoked", v: model });
      out.push({
        t: stamp(0),
        k: "response.received",
        v: `blocks=${blocks ?? 0} chars=${kbChars ?? 0}`,
      });
    }
    return out;
  }, [selectedCount, fieldCount, filledCount, pending, model, blocks, kbChars]);

  return (
    <div className="border border-border bg-background">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 h-8 border-b border-border"
      >
        <span className="num text-[9px] uppercase tracking-[0.22em]" style={{ color: "var(--studio-accent)" }}>
          Operator console · {events.length} events
        </span>
        <span className="num text-[10px] text-muted-foreground">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="font-mono text-[11px] divide-y divide-border/60">
          {events.map((e, i) => (
            <div key={i} className="grid grid-cols-[72px_140px_1fr] gap-2 px-3 py-1.5">
              <span className="text-muted-foreground/70">{e.t}</span>
              <span style={{ color: "var(--studio-accent)" }}>{e.k}</span>
              <span className="text-muted-foreground truncate">{e.v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
