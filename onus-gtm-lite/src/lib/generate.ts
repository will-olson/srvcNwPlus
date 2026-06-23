import { createAiProvider, getDefaultModel } from "@/lib/ai/provider";
import { CITATION_RULE, resolveModuleSystem } from "@/lib/prompts/modules";
import {
  getChunksForDocuments,
  listDocuments,
  loadBrandContext,
  saveGeneration,
} from "@/lib/kb/store";
import type { BrandContext } from "@/lib/kb/types";

export type GenerateInput = {
  module: string;
  documentIds: string[];
  task: string;
  extraContext?: string;
  model?: string;
  maxKbChars?: number;
  includeVoice?: boolean;
  includeWiki?: boolean;
  priorOutput?: string;
  followUp?: string;
};

export type GenerateResult = {
  output: string;
  model: string;
  kbCharsUsed: number;
  blocks: number;
};

function formatBrandContext(ctx: BrandContext, includeVoice: boolean, includeWiki: boolean) {
  const dos = includeVoice
    ? ctx.voice_rules
        .filter((r) => r.kind === "do")
        .map((r) => `- ${r.rule}${r.example ? ` (e.g. ${r.example})` : ""}`)
        .join("\n")
    : "";
  const donts = includeVoice
    ? ctx.voice_rules
        .filter((r) => r.kind === "dont")
        .map((r) => `- ${r.rule}${r.example ? ` (e.g. ${r.example})` : ""}`)
        .join("\n")
    : "";
  const wikiCtx = includeWiki
    ? ctx.brand_wiki_sections.map((w) => `### ${w.title}\n${w.body_md}`).join("\n\n")
    : "";

  return { dos, donts, wikiCtx };
}

export async function runGroundedGeneration(input: GenerateInput): Promise<GenerateResult> {
  const ai = await createAiProvider();
  const model = input.model ?? getDefaultModel();

  const [brandCtx, chunks, docs] = await Promise.all([
    loadBrandContext(),
    getChunksForDocuments(input.documentIds),
    listDocuments(),
  ]);

  const docTitle = new Map(docs.map((d) => [d.id, d.title]));
  const maxKb = input.maxKbChars ?? 280_000;
  let used = 0;
  const kbBlocks: string[] = [];

  for (const c of chunks) {
    const header = `[${docTitle.get(c.document_id) ?? "doc"} · p.${c.page ?? "?"}]`;
    const block = `${header}\n${c.content}\n`;
    if (used + block.length > maxKb) break;
    kbBlocks.push(block);
    used += block.length;
  }

  const { dos, donts, wikiCtx } = formatBrandContext(
    brandCtx,
    input.includeVoice ?? true,
    input.includeWiki ?? true,
  );

  const system = `${resolveModuleSystem(input.module)}

${CITATION_RULE}

BRAND CONTEXT:
${wikiCtx || "(none)"}

VOICE — DO:
${dos || "(none)"}

VOICE — DON'T:
${donts || "(none)"}`;

  const followUpBlock = input.followUp
    ? `\n\nFOLLOW-UP REFINEMENT:\n${input.followUp}\n\nPRIOR DRAFT:\n${input.priorOutput ?? "(none)"}`
    : "";

  const userMsg = `TASK:
${input.task}

ADDITIONAL CONTEXT FROM EDITOR:
${input.extraContext || "(none)"}${followUpBlock}

KNOWLEDGE BASE EXCERPTS (cite by [title · p.N]):
${kbBlocks.join("\n")}`;

  const output = await ai.chat({ system, user: userMsg, model });

  await saveGeneration({
    module: input.module,
    prompt: {
      task: input.task,
      extraContext: input.extraContext,
      model,
      followUp: input.followUp,
    },
    output_md: output,
    document_ids: input.documentIds,
  });

  return { output, model, kbCharsUsed: used, blocks: kbBlocks.length };
}
