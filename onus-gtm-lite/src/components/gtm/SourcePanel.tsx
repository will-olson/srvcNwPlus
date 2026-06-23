import { useRef, useState } from "react";
import { CLUSTER_LABELS, CLUSTER_ORDER } from "@/config/translation-presets";
import type { KbDocument } from "@/lib/kb/types";

export function SourcePanel({
  docs,
  selected,
  setSelected,
  loading,
  onUpload,
  uploading,
}: {
  docs: KbDocument[];
  selected: Set<string>;
  setSelected: (s: Set<string>) => void;
  loading?: boolean;
  onUpload: (file: File) => Promise<void>;
  uploading?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");

  const filtered = docs.filter((d) =>
    !q.trim() ? true : d.title.toLowerCase().includes(q.toLowerCase()),
  );

  const grouped = CLUSTER_ORDER.map((cluster) => ({
    cluster,
    label: CLUSTER_LABELS[cluster] ?? cluster,
    docs: filtered.filter((d) => d.is_seed && d.cluster === cluster),
  })).filter((g) => g.docs.length > 0);

  const ungrouped = filtered.filter(
    (d) => !d.is_seed || !d.cluster || !CLUSTER_ORDER.includes(d.cluster as (typeof CLUSTER_ORDER)[number]),
  );

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const renderDoc = (d: KbDocument) => {
    const on = selected.has(d.id);
    return (
      <label
        key={d.id}
        className={`flex items-center gap-2 cursor-pointer px-1 py-1 ${on ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
      >
        <span
          onClick={(e) => {
            e.preventDefault();
            toggle(d.id);
          }}
          className="inline-flex items-center justify-center h-4 w-4 border text-[10px] leading-none shrink-0"
          style={
            on
              ? {
                  borderColor: "var(--studio-accent)",
                  backgroundColor: "var(--studio-accent)",
                  color: "var(--background)",
                }
              : { borderColor: "var(--border)" }
          }
        >
          {on ? "▸" : ""}
        </span>
        <input type="checkbox" checked={on} onChange={() => toggle(d.id)} className="sr-only" />
        <span className="flex-1 truncate">{d.title}</span>
        {d.is_seed && (
          <span className="text-[8px] uppercase tracking-[0.14em] px-1 border border-border text-muted-foreground shrink-0">
            seed
          </span>
        )}
        <span className="num text-[9px] uppercase tracking-[0.16em] text-muted-foreground shrink-0">
          {d.page_count ?? "?"}p
        </span>
      </label>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="w-full border border-dashed border-border hover:border-[var(--studio-accent)] text-xs py-2 px-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
      >
        {uploading ? "Uploading…" : "+ Upload PDF, MD, or DOCX"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.md,.markdown,.docx,application/pdf,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          await onUpload(file);
          e.target.value = "";
        }}
      />
      <div className="flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter sources…"
          className="bg-background border border-border h-8 px-2 text-xs flex-1"
        />
        <button
          type="button"
          onClick={() => setSelected(new Set(docs.map((d) => d.id)))}
          className="text-[10px] uppercase tracking-[0.18em] num text-muted-foreground hover:text-foreground"
        >
          All
        </button>
        <span className="text-muted-foreground/50">·</span>
        <button
          type="button"
          onClick={() => setSelected(new Set())}
          className="text-[10px] uppercase tracking-[0.18em] num text-muted-foreground hover:text-foreground"
        >
          None
        </button>
      </div>
      {!loading && docs.length > 0 && selected.size === 0 && (
        <div
          className="text-[11px] px-2 py-1.5 border border-dashed"
          style={{
            borderColor: "var(--studio-accent)",
            color: "var(--studio-accent)",
            background: "color-mix(in oklab, var(--studio-accent) 8%, transparent)",
          }}
        >
          Select at least one source to ground the draft.
        </div>
      )}
      {loading && <p className="text-xs text-muted-foreground">Loading sources…</p>}
      {!loading && docs.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No documents yet. Run <code className="num">npm run seed:kb</code> or upload to begin.
        </p>
      )}
      <div className="font-mono text-[11px] leading-relaxed space-y-3">
        {grouped.map((group) => (
          <div key={group.cluster}>
            <div className="num text-[8px] uppercase tracking-[0.2em] text-muted-foreground mb-1 px-1">
              {group.label}
            </div>
            {group.docs.map(renderDoc)}
          </div>
        ))}
        {ungrouped.length > 0 && (
          <div>
            {grouped.length > 0 && (
              <div className="num text-[8px] uppercase tracking-[0.2em] text-muted-foreground mb-1 px-1">
                Other
              </div>
            )}
            {ungrouped.map(renderDoc)}
          </div>
        )}
      </div>
    </div>
  );
}
