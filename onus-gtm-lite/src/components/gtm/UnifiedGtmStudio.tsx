import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ACCENT_VAR, getDiscipline, type DisciplineId } from "@/config/disciplines";
import { TRANSLATION_PRESETS } from "@/config/translation-presets";
import {
  getUseCase,
  getUseCasesForDiscipline,
  type GeneratorField,
  type UseCaseConfig,
} from "@/config/use-cases";
import {
  generateGrounded,
  listGenerationHistory,
  listKbDocuments,
  uploadKbDocument,
  type KbDocument,
} from "@/lib/kb.functions";
import { ChatThread, type ChatMessage } from "./ChatThread";
import { DisciplinePicker } from "./DisciplinePicker";
import { DynamicPromptForm } from "./DynamicPromptForm";
import { OperatorConsole } from "./OperatorConsole";
import { SourcePanel } from "./SourcePanel";
import { UseCaseSelector } from "./UseCaseSelector";
import { Markdown } from "@/lib/markdown";

function defaultValues(fields: GeneratorField[]) {
  const v: Record<string, string> = {};
  for (const f of fields) {
    if (f.type === "select" && f.options[0]) v[f.name] = f.options[0].value;
    else v[f.name] = "";
  }
  return v;
}

export function UnifiedGtmStudio() {
  const queryClient = useQueryClient();
  const listDocs = useServerFn(listKbDocuments);
  const upload = useServerFn(uploadKbDocument);
  const generate = useServerFn(generateGrounded);
  const listHistory = useServerFn(listGenerationHistory);

  const [discipline, setDiscipline] = useState<DisciplineId>("product-strategy");
  const disciplineCases = getUseCasesForDiscipline(discipline);
  const [useCaseId, setUseCaseId] = useState(disciplineCases[0]?.id ?? "pillars");
  const useCase: UseCaseConfig = getUseCase(useCaseId)!;
  const accent = getDiscipline(discipline).accent;

  const [values, setValues] = useState<Record<string, string>>(() => defaultValues(useCase.fields));
  const [extraContext, setExtraContext] = useState("");
  const [includeVoice, setIncludeVoice] = useState(true);
  const [includeWiki, setIncludeWiki] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [followUp, setFollowUp] = useState("");
  const [lastOutput, setLastOutput] = useState("");

  const docsQ = useQuery({ queryKey: ["kb-documents"], queryFn: () => listDocs() });
  const docs = (docsQ.data ?? []) as KbDocument[];

  const historyQ = useQuery({
    queryKey: ["generations", useCase.module],
    queryFn: () => listHistory({ data: { module: useCase.module } }),
  });

  useEffect(() => {
    if (selected.size === 0 && docs.length) {
      setSelected(new Set(docs.map((d) => d.id)));
    }
  }, [docs, selected.size]);

  useEffect(() => {
    const cases = getUseCasesForDiscipline(discipline);
    if (!cases.find((c) => c.id === useCaseId)) {
      setUseCaseId(cases[0]?.id ?? "pillars");
    }
  }, [discipline, useCaseId]);

  useEffect(() => {
    const uc = getUseCase(useCaseId);
    if (uc) {
      setValues(defaultValues(uc.fields));
      setMessages([]);
      setFollowUp("");
      setLastOutput("");
    }
  }, [useCaseId]);

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kb-documents"] }),
  });

  const requiredMissing = useCase.fields.some((f) => {
    if (f.type === "checkbox") return false;
    return f.required && !(values[f.name]?.trim());
  });
  const canSubmit = selected.size > 0 && !requiredMissing;

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
          includeVoice,
          includeWiki,
          priorOutput: prior,
          followUp: opts?.followUpText,
        },
      });
    },
    onSuccess: (data, vars) => {
      const task = useCase.buildTask(values);
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
            meta: `${data.model} · ${data.blocks} KB blocks · ${Math.round(data.kbCharsUsed / 1000)}k chars`,
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

  const applyPreset = (presetId: string) => {
    const preset = TRANSLATION_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setDiscipline(preset.discipline as DisciplineId);
    setUseCaseId(preset.useCaseId);
    setValues(preset.fieldValues);
    setMessages([]);
    setFollowUp("");
    setLastOutput("");

    const matched = docs.filter((d) => preset.documentFilenames.includes(d.filename));
    if (matched.length > 0) {
      setSelected(new Set(matched.map((d) => d.id)));
    }
  };

  const accentStyle = { ["--studio-accent" as string]: ACCENT_VAR[accent] } as CSSProperties;

  return (
    <div style={accentStyle} className="min-h-screen">
      <header className="border-b border-border px-6 h-14 flex items-center gap-3">
        <span className="inline-block h-2 w-2 bg-signal" />
        <span className="font-display font-semibold">OnusGTM</span>
        <span className="num text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Lite</span>
      </header>

      <div className="p-6 max-w-[1400px]">
        <div className="mb-6">
          <div className="num text-[10px] uppercase tracking-[0.22em]" style={{ color: ACCENT_VAR[accent] }}>
            {useCase.eyebrow}
          </div>
          <h1 className="mt-2 font-display text-3xl tracking-tight">{useCase.title}</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl text-sm">{useCase.intro}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <DisciplinePicker
              active={discipline}
              onChange={(id) => {
                setDiscipline(id);
                const first = getUseCasesForDiscipline(id)[0];
                if (first) setUseCaseId(first.id);
              }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="num text-[9px] uppercase tracking-[0.18em] text-muted-foreground self-center">
              Translation presets
            </span>
            {TRANSLATION_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className="text-[10px] px-2 py-1 border border-border hover:border-[var(--studio-accent)] text-muted-foreground hover:text-foreground"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[260px_1fr] gap-px bg-border border border-border">
          <aside className="bg-background p-4">
            <div className="num text-[9px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
              Sources tree
            </div>
            <SourcePanel
              docs={docs}
              selected={selected}
              setSelected={setSelected}
              loading={docsQ.isLoading}
              uploading={uploadMut.isPending}
              onUpload={async (file) => {
                await uploadMut.mutateAsync(file);
              }}
            />
          </aside>

          <div className="bg-background grid grid-cols-[1fr_1.4fr] gap-px bg-border">
            <div className="bg-background p-5 space-y-4">
              <div className="num text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                Operator input
              </div>
              <UseCaseSelector discipline={discipline} activeId={useCaseId} onChange={setUseCaseId} />
              <DynamicPromptForm
                fields={useCase.fields}
                values={values}
                setValues={setValues}
                extraContext={extraContext}
                setExtraContext={setExtraContext}
                includeVoice={includeVoice}
                setIncludeVoice={setIncludeVoice}
                includeWiki={includeWiki}
                setIncludeWiki={setIncludeWiki}
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
                  <span>F1</span>
                  <span>{genMut.isPending ? "Running…" : "Generate"}</span>
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
                fieldCount={useCase.fields.length}
                filledCount={filledCount}
                pending={genMut.isPending}
                model={messages.find((m) => m.role === "assistant")?.meta?.split(" ·")[0]}
                blocks={
                  genMut.data?.blocks ??
                  Number(messages.find((m) => m.meta?.includes("KB blocks"))?.meta?.match(/(\d+) KB/)?.[1])
                }
                kbChars={genMut.data?.kbCharsUsed}
              />
              {historyQ.data && historyQ.data.length > 0 && (
                <div>
                  <div className="num text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
                    History · {historyQ.data.length}
                  </div>
                  <div className="border border-border divide-y divide-border max-h-48 overflow-y-auto">
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
