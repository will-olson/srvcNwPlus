import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ACCENT_VAR, getDiscipline } from "@/config/disciplines";
import {
  getDefaultTemplateId,
  getTemplate,
  getTemplatesForWorkspace,
  getWorkspace,
  resolveTemplateDocumentIds,
  type WorkspaceId,
} from "@/config/cluster-workspaces";
import { getUseCase, type GeneratorField } from "@/config/use-cases";
import {
  generateGrounded,
  getServiceStatus,
  listGenerationHistory,
  listKbDocuments,
  searchNewsArticles,
  uploadKbDocument,
  type KbDocument,
} from "@/lib/kb.functions";
import { validateDocumentSelection } from "@/lib/kb/selection-policy";
import { BoundSources } from "./BoundSources";
import { ChatThread, type ChatMessage } from "./ChatThread";
import { DynamicPromptForm } from "./DynamicPromptForm";
import { defaultNewsState, NewsPanel, type NewsPanelState } from "./NewsPanel";
import { OperatorConsole } from "./OperatorConsole";
import { SourcePanel, type SourcePanelMode } from "./SourcePanel";
import { TemplatePicker } from "./TemplatePicker";
import { WorkspacePicker } from "./WorkspacePicker";
import { Markdown } from "@/lib/markdown";

function templateDefaultValues(
  templateDefaults: Record<string, string>,
  fields: GeneratorField[],
): Record<string, string> {
  const v = { ...templateDefaults };
  for (const f of fields) {
    if (f.type === "select" && f.options[0] && !v[f.name]) {
      v[f.name] = f.options[0].value;
    } else if (!(f.name in v)) {
      v[f.name] = "";
    }
  }
  return v;
}

export function UnifiedGtmStudio() {
  const queryClient = useQueryClient();
  const listDocs = useServerFn(listKbDocuments);
  const upload = useServerFn(uploadKbDocument);
  const generate = useServerFn(generateGrounded);
  const listHistory = useServerFn(listGenerationHistory);
  const serviceStatus = useServerFn(getServiceStatus);
  const searchNews = useServerFn(searchNewsArticles);

  const [workspace, setWorkspace] = useState<WorkspaceId>("echelon");
  const [templateId, setTemplateId] = useState(() => getDefaultTemplateId("echelon"));
  const template = getTemplate(templateId)!;
  const useCase = getUseCase(template.useCaseId)!;
  const workspaceMeta = getWorkspace(workspace);
  const accent = getDiscipline(workspaceMeta.discipline).accent;
  const formFields = template.fields ?? useCase.fields;

  const [values, setValues] = useState<Record<string, string>>(() =>
    templateDefaultValues(template.defaultValues, formFields),
  );
  const [extraContext, setExtraContext] = useState("");
  const [includeVoice, setIncludeVoice] = useState(true);
  const [includeWiki, setIncludeWiki] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [followUp, setFollowUp] = useState("");
  const [lastOutput, setLastOutput] = useState("");
  const [newsState, setNewsState] = useState<NewsPanelState>(defaultNewsState);
  const [newsPreviewError, setNewsPreviewError] = useState<string | null>(null);

  const statusQ = useQuery({ queryKey: ["service-status"], queryFn: () => serviceStatus() });
  const newsAvailable = statusQ.data?.news === "ok";
  const aiMissing =
    statusQ.data &&
    (statusQ.data.provider === "lovable"
      ? statusQ.data.lovable === "missing"
      : statusQ.data.openai === "missing");

  const docsQ = useQuery({ queryKey: ["kb-documents"], queryFn: () => listDocs() });
  const docs = (docsQ.data ?? []) as KbDocument[];

  const historyQ = useQuery({
    queryKey: ["generations", useCase.module],
    queryFn: () => listHistory({ data: { module: useCase.module } }),
  });

  const sourcePanelMode: SourcePanelMode =
    workspace === "uploads" ? "uploads" : workspace === "competitive" ? "competitive" : "template-bound";

  const selectedDocs = useMemo(
    () => docs.filter((d) => selected.has(d.id)),
    [docs, selected],
  );

  useEffect(() => {
    const t = getTemplate(templateId);
    if (!t) return;
    const uc = getUseCase(t.useCaseId);
    const fields = t.fields ?? uc?.fields ?? [];
    setValues(templateDefaultValues(t.defaultValues, fields));

    if (workspace === "uploads") {
      setSelected(new Set());
    } else {
      const ids = resolveTemplateDocumentIds(t, docs);
      setSelected(new Set(ids));
    }
    setMessages([]);
    setFollowUp("");
    setLastOutput("");
  }, [templateId, workspace, docs]);

  const handleWorkspaceChange = (ws: WorkspaceId) => {
    setWorkspace(ws);
    setTemplateId(getDefaultTemplateId(ws));
  };

  const uploadMut = useMutation({
    mutationFn: async (file: File) => {
      const buf = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      return upload({
        data: {
          title: file.name.replace(/\.[^.]+$/, ""),
          filename: file.name,
          base64,
        },
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["kb-documents"] });
      if (workspace === "uploads") {
        setSelected((prev) => new Set([...prev, data.id]));
      }
    },
  });

  const requiredMissing = formFields.some((f) => {
    if (f.type === "checkbox") return false;
    return f.required && !(values[f.name]?.trim());
  });

  const selectionValidation = validateDocumentSelection(workspace, useCase.module, selectedDocs);
  const hasKbSources = selected.size > 0 && selectionValidation.ok;
  const hasNewsSources =
    newsState.enabled &&
    (newsState.mode === "top-headlines" || newsState.query.trim().length > 0);
  const canSubmit = (hasKbSources || hasNewsSources) && !requiredMissing;
  const showBrandToggles = workspace === "echelon";

  const buildNewsPayload = (task: string) => {
    if (!newsState.enabled) return undefined;
    const query = newsState.query.trim() || task.slice(0, 120);
    return {
      enabled: true as const,
      query,
      recencyDays: newsState.recencyDays,
      sortBy: newsState.sortBy,
      mode: newsState.mode,
      category: newsState.category,
      domains: newsState.domains || undefined,
      pageSize: newsState.pageSize,
      articleIds:
        newsState.selectedArticleIds.size > 0
          ? Array.from(newsState.selectedArticleIds)
          : undefined,
    };
  };

  const previewMut = useMutation({
    mutationFn: async () => {
      const task = useCase.buildTask(values);
      return searchNews({
        data: {
          query: newsState.query.trim() || task.slice(0, 120),
          recencyDays: newsState.recencyDays,
          sortBy: newsState.sortBy,
          mode: newsState.mode,
          category: newsState.category,
          domains: newsState.domains || undefined,
          pageSize: newsState.pageSize,
        },
      });
    },
    onSuccess: (data) => {
      setNewsPreviewError(null);
      setNewsState((prev) => ({
        ...prev,
        previewArticles: data.articles,
        selectedArticleIds: new Set(data.articles.map((a) => a.id)),
      }));
    },
    onError: (err) => {
      setNewsPreviewError(err instanceof Error ? err.message : "News preview failed");
    },
  });

  const genMut = useMutation({
    mutationFn: async (opts?: { followUpText?: string }) => {
      const task = useCase.buildTask(values);
      const prior = opts?.followUpText ? lastOutput : undefined;
      return generate({
        data: {
          module: useCase.module,
          documentIds: Array.from(selected),
          task,
          extraContext,
          includeVoice: showBrandToggles ? includeVoice : false,
          includeWiki: showBrandToggles ? includeWiki : false,
          priorOutput: prior,
          followUp: opts?.followUpText,
          news: buildNewsPayload(task),
        },
      });
    },
    onSuccess: (data, vars) => {
      const task = useCase.buildTask(values);
      const metaParts = [
        data.model,
        `${data.blocks} KB blocks`,
        data.newsArticlesUsed > 0 ? `${data.newsArticlesUsed} news` : null,
        `${Math.round(data.kbCharsUsed / 1000)}k chars`,
      ].filter(Boolean);
      if (!vars?.followUpText) {
        setMessages([
          {
            id: crypto.randomUUID(),
            role: "user",
            content: task,
            createdAt: new Date().toISOString(),
          },
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.output,
            meta: metaParts.join(" · "),
            createdAt: new Date().toISOString(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "user",
            content: vars.followUpText!,
            createdAt: new Date().toISOString(),
          },
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.output,
            meta: `${data.model} · refinement`,
            createdAt: new Date().toISOString(),
          },
        ]);
        setFollowUp("");
      }
      setLastOutput(data.output);
      queryClient.invalidateQueries({ queryKey: ["generations", useCase.module] });
    },
  });

  const filledCount = useMemo(
    () => Object.values(values).filter((v) => v?.trim()).length,
    [values],
  );

  const accentStyle = { ["--studio-accent" as string]: ACCENT_VAR[accent] } as CSSProperties;

  return (
    <div style={accentStyle} className="min-h-screen">
      <header className="border-b border-border px-6 h-14 flex items-center gap-3">
        <span className="inline-block h-2 w-2 bg-signal" />
        <span className="font-display font-semibold">OnusGTM</span>
        <span className="num text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Lite</span>
      </header>

      <div className="p-6 max-w-[1400px]">
        {aiMissing && (
          <div className="mb-4 text-xs border border-destructive/40 text-destructive px-3 py-2">
            {statusQ.data?.provider === "lovable"
              ? "LOVABLE_API_KEY is missing — set it in repo-root .env"
              : "OPENAI_API_KEY is missing — set it in repo-root .env"}
          </div>
        )}

        <div className="mb-6 space-y-4">
          <div>
            <div className="num text-[10px] uppercase tracking-[0.22em]" style={{ color: ACCENT_VAR[accent] }}>
              {workspaceMeta.label}
            </div>
            <h1 className="mt-2 font-display text-3xl tracking-tight">{template.label}</h1>
            <p className="mt-2 text-muted-foreground max-w-2xl text-sm">{template.description}</p>
          </div>
          <WorkspacePicker active={workspace} onChange={handleWorkspaceChange} />
        </div>

        <div className="grid grid-cols-[260px_1fr] gap-px bg-border border border-border">
          <aside className="bg-background p-4 space-y-4">
            <div className="num text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
              Sources
            </div>
            <SourcePanel
              docs={docs}
              selected={selected}
              setSelected={setSelected}
              workspace={workspace}
              mode={sourcePanelMode}
              boundDocIds={selected}
              loading={docsQ.isLoading}
              uploading={uploadMut.isPending}
              onUpload={async (file) => {
                await uploadMut.mutateAsync(file);
              }}
            />
            <NewsPanel
              discipline={workspaceMeta.discipline}
              newsAvailable={newsAvailable}
              state={newsState}
              setState={setNewsState}
              onPreview={() => previewMut.mutate()}
              previewing={previewMut.isPending}
              previewError={newsPreviewError}
            />
          </aside>

          <div className="bg-background grid grid-cols-[1fr_1.4fr] gap-px bg-border">
            <div className="bg-background p-5 space-y-4">
              <TemplatePicker
                templates={getTemplatesForWorkspace(workspace)}
                activeId={templateId}
                onChange={setTemplateId}
              />
              <BoundSources
                docs={docs}
                selectedIds={selected}
                hint={
                  workspace === "uploads"
                    ? "Select uploaded documents below to ground your draft."
                    : "Pick a template to bind knowledge base sources."
                }
              />
              {!selectionValidation.ok && selected.size > 0 && (
                <div className="text-xs text-destructive border border-destructive/40 p-2">
                  {selectionValidation.message}
                </div>
              )}
              <div className="num text-[9px] uppercase tracking-[0.22em] text-muted-foreground pt-2 border-t border-border">
                3 · Configure inputs
              </div>
              <DynamicPromptForm
                fields={formFields}
                values={values}
                setValues={setValues}
                extraContext={extraContext}
                setExtraContext={setExtraContext}
                includeVoice={includeVoice}
                setIncludeVoice={setIncludeVoice}
                includeWiki={includeWiki}
                setIncludeWiki={setIncludeWiki}
                showBrandToggles={showBrandToggles}
              />
              <div className="pt-2 border-t border-border flex gap-2">
                <button
                  type="button"
                  disabled={!canSubmit || genMut.isPending}
                  onClick={() => genMut.mutate(undefined)}
                  className="inline-flex items-center gap-3 border px-4 h-9 text-xs uppercase tracking-[0.22em] num disabled:opacity-40 transition-colors"
                  style={{
                    borderColor: "var(--studio-accent)",
                    color: "var(--studio-accent)",
                  }}
                >
                  <span>{genMut.isPending ? "Running…" : "Generate draft"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMessages([]);
                    setFollowUp("");
                    setLastOutput("");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground px-2"
                >
                  New session
                </button>
              </div>
              {genMut.error && (
                <div className="text-xs text-destructive border border-destructive/40 p-2">
                  {(genMut.error as Error).message}
                </div>
              )}
            </div>

            <div className="bg-background p-5 space-y-4">
              <ChatThread messages={messages} pending={genMut.isPending} />
              {lastOutput && (
                <div className="border border-border p-3 space-y-2">
                  <div className="num text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                    Follow-up refinement
                  </div>
                  <textarea
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    rows={2}
                    placeholder="Ask for a shorter version, different tone, or additional section…"
                    className="bg-background border border-border p-2 text-xs w-full"
                  />
                  <button
                    type="button"
                    disabled={!followUp.trim() || genMut.isPending}
                    onClick={() => genMut.mutate({ followUpText: followUp })}
                    className="text-xs px-3 py-1.5 border border-border hover:border-[var(--studio-accent)] disabled:opacity-40"
                  >
                    Send follow-up
                  </button>
                </div>
              )}
              <OperatorConsole
                selectedCount={selected.size}
                fieldCount={formFields.length}
                filledCount={filledCount}
                pending={genMut.isPending}
                model={messages.find((m) => m.role === "assistant")?.meta?.split(" ·")[0]}
                blocks={
                  genMut.data?.blocks ??
                  Number(messages.find((m) => m.meta?.includes("KB blocks"))?.meta?.match(/(\d+) KB/)?.[1])
                }
                kbChars={genMut.data?.kbCharsUsed}
                newsQuery={genMut.data?.newsQuery}
                newsFetched={newsState.previewArticles.length || genMut.data?.newsArticlesUsed}
                newsSelected={
                  newsState.selectedArticleIds.size || genMut.data?.newsArticlesUsed
                }
              />
              {historyQ.data && historyQ.data.length > 0 && (
                <details className="border border-border">
                  <summary className="cursor-pointer px-3 py-2 num text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    History · {historyQ.data.length}
                  </summary>
                  <div className="divide-y divide-border max-h-48 overflow-y-auto">
                    {historyQ.data.slice(0, 5).map((g) => (
                      <details key={g.id} className="px-3 py-2">
                        <summary className="cursor-pointer text-xs truncate">
                          {(g.prompt as { task?: string })?.task?.slice(0, 80) ?? "(no prompt)"}
                        </summary>
                        <div className="mt-2 prose-style text-xs">
                          <Markdown source={g.output_md} />
                        </div>
                      </details>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
