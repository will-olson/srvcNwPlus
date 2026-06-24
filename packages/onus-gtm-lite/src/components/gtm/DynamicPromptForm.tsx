import type { GeneratorField } from "@/config/use-cases";

function Suggestions({
  items,
  onPick,
}: {
  items?: string[];
  onPick: (s: string) => void;
}) {
  if (!items?.length) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {items.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onPick(s)}
          title={s}
          className="text-[10px] px-1.5 py-0.5 border border-border bg-surface/40 hover:border-[var(--studio-accent)] hover:text-foreground text-muted-foreground truncate max-w-[260px]"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

export function DynamicPromptForm({
  fields,
  values,
  setValues,
  extraContext,
  setExtraContext,
  includeVoice,
  setIncludeVoice,
  includeWiki,
  setIncludeWiki,
  showBrandToggles = true,
}: {
  fields: GeneratorField[];
  values: Record<string, string>;
  setValues: (v: Record<string, string>) => void;
  extraContext: string;
  setExtraContext: (v: string) => void;
  includeVoice: boolean;
  setIncludeVoice: (v: boolean) => void;
  includeWiki: boolean;
  setIncludeWiki: (v: boolean) => void;
  showBrandToggles?: boolean;
}) {
  const inputCls =
    "bg-background border border-border h-8 px-2 text-xs w-full focus:border-[var(--studio-accent)] focus:outline-none";
  const taCls =
    "bg-background border border-border p-2 text-xs w-full font-sans focus:border-[var(--studio-accent)] focus:outline-none";

  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <div key={f.name}>
          <div className="num text-[9px] uppercase tracking-[0.22em] text-muted-foreground mb-1.5">
            {f.label}
          </div>
          {f.type === "text" && (
            <>
              <input
                value={values[f.name] ?? ""}
                onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                placeholder={f.placeholder}
                required={f.required}
                className={inputCls}
              />
              <Suggestions
                items={f.suggestions}
                onPick={(s) => setValues({ ...values, [f.name]: s })}
              />
            </>
          )}
          {f.type === "textarea" && (
            <>
              <textarea
                value={values[f.name] ?? ""}
                onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                placeholder={f.placeholder}
                rows={f.rows ?? 3}
                required={f.required}
                className={taCls}
              />
              <Suggestions
                items={f.suggestions}
                onPick={(s) => setValues({ ...values, [f.name]: s })}
              />
            </>
          )}
          {f.type === "select" && (
            <select
              value={values[f.name] ?? ""}
              onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
              className={inputCls}
            >
              <option value="">Select…</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
          {f.type === "checkbox" && (
            <label className="flex items-start gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={values[f.name] === "true"}
                onChange={(e) =>
                  setValues({ ...values, [f.name]: e.target.checked ? "true" : "false" })
                }
                className="mt-0.5"
              />
              <span>{f.description ?? f.label}</span>
            </label>
          )}
        </div>
      ))}

      {showBrandToggles && (
        <div className="flex flex-col gap-2 pt-2 border-t border-border">
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={includeVoice} onChange={(e) => setIncludeVoice(e.target.checked)} />
            Include brand voice (from data/seeds/brand-context.json)
          </label>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={includeWiki} onChange={(e) => setIncludeWiki(e.target.checked)} />
            Include brand wiki (from data/seeds/brand-context.json)
          </label>
        </div>
      )}

      <details className="border border-border bg-background/50 px-3 py-2">
        <summary className="num text-[9px] uppercase tracking-[0.22em] text-muted-foreground cursor-pointer">
          Editor notes (optional)
        </summary>
        <textarea
          value={extraContext}
          onChange={(e) => setExtraContext(e.target.value)}
          rows={3}
          placeholder="Specific angle, data point, or constraint to anchor on…"
          className={`${taCls} mt-2`}
        />
      </details>
    </div>
  );
}
