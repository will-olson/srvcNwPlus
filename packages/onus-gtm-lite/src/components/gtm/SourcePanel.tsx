import { useRef, useState } from "react";
import type { WorkspaceId } from "@/config/cluster-workspaces";
import { CLUSTER_LABELS, CLUSTER_ORDER } from "@/config/cluster-workspaces";
import {
  getCompetitiveSeedDocs,
  getUploadDocs,
  toggleCompetitiveSelection,
  toggleUploadSelection,
} from "@/lib/kb/selection-policy";
import type { KbDocument } from "@/lib/kb/types";

export type SourcePanelMode = "template-bound" | "competitive" | "uploads";

export function SourcePanel({
  docs,
  selected,
  setSelected,
  workspace,
  mode,
  boundDocIds,
  loading,
  onUpload,
  uploading,
}: {
  docs: KbDocument[];
  selected: Set<string>;
  setSelected: (s: Set<string>) => void;
  workspace: WorkspaceId;
  mode: SourcePanelMode;
  boundDocIds: Set<string>;
  loading?: boolean;
  onUpload: (file: File) => Promise<void>;
  uploading?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");

  const uploads = getUploadDocs(docs);
  const competitiveSeeds = getCompetitiveSeedDocs(docs);
  const uploadIds = new Set(uploads.map((d) => d.id));
  const competitiveIds = new Set(competitiveSeeds.map((d) => d.id));

  const clusterDocs =
    workspace === "echelon" || workspace === "profound" || workspace === "monte-carlo"
      ? docs.filter((d) => d.is_seed && d.cluster === workspace)
      : [];

  const filteredCluster = clusterDocs.filter(
    (d) => !q.trim() || d.title.toLowerCase().includes(q.toLowerCase()),
  );
  const filteredCompetitive = competitiveSeeds.filter(
    (d) => !q.trim() || d.title.toLowerCase().includes(q.toLowerCase()),
  );
  const filteredUploads = uploads.filter(
    (d) => !q.trim() || d.title.toLowerCase().includes(q.toLowerCase()),
  );

  const renderReadOnlyDoc = (d: KbDocument) => {
    const bound = boundDocIds.has(d.id);
    return (
      <div
        key={d.id}
        className={`flex items-center gap-2 px-1 py-1 ${bound ? "text-foreground" : "text-muted-foreground/60"}`}
      >
        <span
          className="inline-flex items-center justify-center h-4 w-4 border text-[10px] leading-none shrink-0"
          style={
            bound
              ? {
                  borderColor: "var(--studio-accent)",
                  backgroundColor: "var(--studio-accent)",
                  color: "var(--background)",
                }
              : { borderColor: "var(--border)" }
          }
        >
          {bound ? "▸" : ""}
        </span>
        <span className="flex-1 truncate">{d.title}</span>
        {bound && (
          <span className="text-[8px] uppercase tracking-[0.14em] px-1 border border-[var(--studio-accent)] shrink-0">
            active
          </span>
        )}
        <span className="num text-[9px] uppercase tracking-[0.16em] text-muted-foreground shrink-0">
          {d.page_count ?? "?"}p
        </span>
      </div>
    );
  };

  const renderToggleDoc = (
    d: KbDocument,
    allowedIds: Set<string>,
    toggleFn: (current: Set<string>, id: string, allowed: Set<string>) => Set<string>,
  ) => {
    const on = selected.has(d.id);
    return (
      <label
        key={d.id}
        className={`flex items-center gap-2 cursor-pointer px-1 py-1 ${on ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
      >
        <span
          onClick={(e) => {
            e.preventDefault();
            setSelected(toggleFn(selected, d.id, allowedIds));
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
        <input
          type="checkbox"
          checked={on}
          onChange={() => setSelected(toggleFn(selected, d.id, allowedIds))}
          className="sr-only"
        />
        <span className="flex-1 truncate">{d.title}</span>
        <span className="num text-[9px] uppercase tracking-[0.16em] text-muted-foreground shrink-0">
          {d.page_count ?? "?"}p
        </span>
      </label>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter sources…"
        className="bg-background border border-border h-8 px-2 text-xs w-full"
      />

      {loading && <p className="text-xs text-muted-foreground">Loading sources…</p>}

      {mode === "template-bound" && (
        <div className="font-mono text-[11px] leading-relaxed space-y-2">
          <div className="num text-[8px] uppercase tracking-[0.2em] text-muted-foreground px-1">
            {CLUSTER_LABELS[workspace] ?? workspace} · template-bound
          </div>
          {filteredCluster.length === 0 && !loading && (
            <p className="text-xs text-muted-foreground px-1">No seed docs for this workspace.</p>
          )}
          {filteredCluster.map(renderReadOnlyDoc)}
          <p className="text-[10px] text-muted-foreground px-1 pt-1">
            Sources are set by your template. Switch templates to change grounding.
          </p>
        </div>
      )}

      {mode === "competitive" && (
        <div className="font-mono text-[11px] leading-relaxed space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="num text-[8px] uppercase tracking-[0.2em] text-muted-foreground">
              Competitive intel · multi-select
            </div>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-[10px] uppercase tracking-[0.18em] num text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
          {filteredCompetitive.map((d) =>
            renderToggleDoc(d, competitiveIds, toggleCompetitiveSelection),
          )}
          <p className="text-[10px] text-muted-foreground px-1">
            Only cross-cluster competitive docs can be combined here.
          </p>
        </div>
      )}

      {mode === "uploads" && (
        <div className="font-mono text-[11px] leading-relaxed space-y-2 border-t border-border pt-3">
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="num text-[8px] uppercase tracking-[0.2em] text-muted-foreground">
              My uploads
            </div>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-[10px] uppercase tracking-[0.18em] num text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
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
          {filteredUploads.length === 0 && !loading && (
            <p className="text-xs text-muted-foreground px-1">Upload documents to ground your draft.</p>
          )}
          {filteredUploads.map((d) => renderToggleDoc(d, uploadIds, toggleUploadSelection))}
        </div>
      )}

      {mode !== "uploads" && (
        <div className="border-t border-border pt-3 space-y-2">
          <div className="num text-[8px] uppercase tracking-[0.2em] text-muted-foreground px-1">
            Reference · other seed libraries
          </div>
          {CLUSTER_ORDER.filter((c) => c !== workspace).map((cluster) => {
            const clusterSeedDocs = docs.filter(
              (d) => d.is_seed && d.cluster === cluster && !boundDocIds.has(d.id),
            );
            if (clusterSeedDocs.length === 0) return null;
            return (
              <div key={cluster} className="opacity-50 pointer-events-none">
                <div className="num text-[8px] uppercase tracking-[0.16em] text-muted-foreground mb-0.5 px-1">
                  {CLUSTER_LABELS[cluster]}
                </div>
                {clusterSeedDocs.slice(0, 2).map((d) => (
                  <div key={d.id} className="text-[10px] text-muted-foreground truncate px-1">
                    {d.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {!loading && selected.size === 0 && mode !== "template-bound" && (
        <div
          className="text-[11px] px-2 py-1.5 border border-dashed"
          style={{
            borderColor: "var(--studio-accent)",
            color: "var(--studio-accent)",
            background: "color-mix(in oklab, var(--studio-accent) 8%, transparent)",
          }}
        >
          Select sources for this workspace, or enable recent news.
        </div>
      )}
    </div>
  );
}
