import { useState } from "react";
import { getNewsPresetsForDiscipline } from "@/config/news-presets";
import type { DisciplineId } from "@/config/disciplines";
import type {
  NewsArticle,
  NewsCategory,
  NewsRecencyDays,
  NewsSearchMode,
  NewsSortBy,
} from "@/lib/news/types";

export type NewsPanelState = {
  enabled: boolean;
  query: string;
  recencyDays: NewsRecencyDays;
  sortBy: NewsSortBy;
  mode: NewsSearchMode;
  category: NewsCategory;
  domains: string;
  pageSize: number;
  selectedArticleIds: Set<string>;
  previewArticles: NewsArticle[];
};

export const defaultNewsState: NewsPanelState = {
  enabled: false,
  query: "",
  recencyDays: "30",
  sortBy: "relevancy",
  mode: "everything",
  category: "business",
  domains: "",
  pageSize: 8,
  selectedArticleIds: new Set(),
  previewArticles: [],
};

export function NewsPanel({
  discipline,
  newsAvailable,
  state,
  setState,
  onPreview,
  previewing,
  previewError,
}: {
  discipline: DisciplineId;
  newsAvailable: boolean;
  state: NewsPanelState;
  setState: (s: NewsPanelState) => void;
  onPreview: () => void;
  previewing?: boolean;
  previewError?: string | null;
}) {
  const [open, setOpen] = useState(true);
  const presets = getNewsPresetsForDiscipline(discipline);
  const inputCls =
    "bg-background border border-border h-8 px-2 text-xs w-full focus:border-[var(--studio-accent)] focus:outline-none";
  const selectCls = inputCls;

  const patch = (partial: Partial<NewsPanelState>) => setState({ ...state, ...partial });

  const toggleArticle = (id: string) => {
    const next = new Set(state.selectedArticleIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    patch({ selectedArticleIds: next });
  };

  return (
    <div className="mt-6 pt-4 border-t border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between mb-3"
      >
        <span className="num text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
          Recent news
        </span>
        <span className="num text-[10px] text-muted-foreground">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={state.enabled}
              onChange={(e) => patch({ enabled: e.target.checked })}
              disabled={!newsAvailable}
            />
            Include recent news articles
          </label>

          {!newsAvailable && (
            <p className="text-[11px] text-muted-foreground">
              Set <code className="num">NEWS_API_KEY</code> in repo-root <code className="num">.env</code>.
            </p>
          )}

          {state.enabled && newsAvailable && (
            <>
              <div>
                <div className="num text-[9px] uppercase tracking-[0.22em] text-muted-foreground mb-1.5">
                  Search query
                </div>
                <input
                  value={state.query}
                  onChange={(e) => patch({ query: e.target.value })}
                  placeholder="Keywords for NewsAPI.org…"
                  className={inputCls}
                />
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {presets.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => patch({ query: p.query })}
                      className="text-[10px] px-1.5 py-0.5 border border-border bg-surface/40 hover:border-[var(--studio-accent)] text-muted-foreground truncate max-w-[240px]"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="num text-[9px] uppercase tracking-[0.22em] text-muted-foreground mb-1.5">
                    Recency
                  </div>
                  <select
                    value={state.recencyDays}
                    onChange={(e) => patch({ recencyDays: e.target.value as NewsRecencyDays })}
                    className={selectCls}
                    disabled={state.mode === "top-headlines"}
                  >
                    <option value="7">7 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                  </select>
                </div>
                <div>
                  <div className="num text-[9px] uppercase tracking-[0.22em] text-muted-foreground mb-1.5">
                    Mode
                  </div>
                  <select
                    value={state.mode}
                    onChange={(e) => patch({ mode: e.target.value as NewsSearchMode })}
                    className={selectCls}
                  >
                    <option value="everything">Keyword search</option>
                    <option value="top-headlines">Top headlines</option>
                  </select>
                </div>
                <div>
                  <div className="num text-[9px] uppercase tracking-[0.22em] text-muted-foreground mb-1.5">
                    Sort
                  </div>
                  <select
                    value={state.sortBy}
                    onChange={(e) => patch({ sortBy: e.target.value as NewsSortBy })}
                    className={selectCls}
                    disabled={state.mode === "top-headlines"}
                  >
                    <option value="relevancy">Relevancy</option>
                    <option value="publishedAt">Published date</option>
                  </select>
                </div>
                <div>
                  <div className="num text-[9px] uppercase tracking-[0.22em] text-muted-foreground mb-1.5">
                    Articles
                  </div>
                  <select
                    value={state.pageSize}
                    onChange={(e) => patch({ pageSize: Number.parseInt(e.target.value, 10) })}
                    className={selectCls}
                  >
                    {[4, 8, 12, 16, 20].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {state.mode === "top-headlines" && (
                <div>
                  <div className="num text-[9px] uppercase tracking-[0.22em] text-muted-foreground mb-1.5">
                    Category
                  </div>
                  <select
                    value={state.category}
                    onChange={(e) => patch({ category: e.target.value as NewsCategory })}
                    className={selectCls}
                  >
                    <option value="business">Business</option>
                    <option value="technology">Technology</option>
                    <option value="general">General</option>
                  </select>
                </div>
              )}

              {state.mode === "everything" && (
                <div>
                  <div className="num text-[9px] uppercase tracking-[0.22em] text-muted-foreground mb-1.5">
                    Domains (optional)
                  </div>
                  <input
                    value={state.domains}
                    onChange={(e) => patch({ domains: e.target.value })}
                    placeholder="reuters.com, techcrunch.com"
                    className={inputCls}
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Free NewsAPI plans may limit archive depth (typically 30 days).
                  </p>
                </div>
              )}

              <button
                type="button"
                disabled={
                  previewing ||
                  (state.mode === "everything" && !state.query.trim())
                }
                onClick={onPreview}
                className="w-full border border-border hover:border-[var(--studio-accent)] text-xs py-2 px-2 text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                {previewing ? "Fetching…" : "Preview articles"}
              </button>

              {previewError && (
                <div className="text-[11px] text-destructive border border-destructive/40 p-2">
                  {previewError}
                </div>
              )}

              {state.previewArticles.length > 0 && (
                <div className="font-mono text-[11px] space-y-1 max-h-48 overflow-y-auto">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      type="button"
                      onClick={() =>
                        patch({
                          selectedArticleIds: new Set(state.previewArticles.map((a) => a.id)),
                        })
                      }
                      className="text-[10px] uppercase tracking-[0.18em] num text-muted-foreground hover:text-foreground"
                    >
                      All
                    </button>
                    <span className="text-muted-foreground/50">·</span>
                    <button
                      type="button"
                      onClick={() => patch({ selectedArticleIds: new Set() })}
                      className="text-[10px] uppercase tracking-[0.18em] num text-muted-foreground hover:text-foreground"
                    >
                      None
                    </button>
                  </div>
                  {state.previewArticles.map((article) => {
                    const on = state.selectedArticleIds.has(article.id);
                    return (
                      <label
                        key={article.id}
                        className={`flex items-start gap-2 cursor-pointer px-1 py-1 ${on ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <span
                          onClick={(e) => {
                            e.preventDefault();
                            toggleArticle(article.id);
                          }}
                          className="inline-flex items-center justify-center h-4 w-4 border text-[10px] leading-none shrink-0 mt-0.5"
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
                          onChange={() => toggleArticle(article.id)}
                          className="sr-only"
                        />
                        <span className="flex-1">
                          <span className="block truncate">{article.title}</span>
                          <span className="text-[9px] text-muted-foreground">
                            {article.source} · {article.publishedDate}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
