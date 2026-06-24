import { createAiProvider, getDefaultModel } from "@/lib/ai/provider";
import { CITATION_RULE, resolveModuleSystem } from "@/lib/prompts/modules";
import {
  formatDistillatesForPrompt,
  rankChunksByTask,
} from "@/lib/kb/distill";
import {
  getChunksForDocuments,
  listDocuments,
  loadBrandContext,
  loadDistillate,
  saveGeneration,
} from "@/lib/kb/store";
import type { BrandContext, KbChunk } from "@/lib/kb/types";
import { buildNewsPromptBlock } from "@/lib/news/format";
import {
  deriveNewsQuery,
  filterArticlesByIds,
  searchNews,
} from "@/lib/news/search";
import type { NewsInput } from "@/lib/news/types";

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
  news?: NewsInput;
};

export type GenerateResult = {
  output: string;
  model: string;
  kbCharsUsed: number;
  blocks: number;
  newsArticlesUsed: number;
  newsQuery: string;
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
  const distillates = (
    await Promise.all(input.documentIds.map((id) => loadDistillate(id)))
  ).filter((d): d is NonNullable<typeof d> => d !== null);

  const distillateBlock = formatDistillatesForPrompt(distillates, docTitle);
  const rankedChunks: KbChunk[] = rankChunksByTask(chunks, input.task, input.documentIds.length);

  const maxKb = input.maxKbChars ?? 280_000;
  let used = distillateBlock.length;
  const kbBlocks: string[] = [];

  if (distillateBlock.trim()) {
    kbBlocks.push(`DOCUMENT DISTILLATES:\n${distillateBlock}`);
  }

  for (const c of rankedChunks) {
    const header = `[${docTitle.get(c.document_id) ?? "doc"} · p.${c.page ?? "?"}]`;
    const block = `${header}\n${c.content}\n`;
    if (used + block.length > maxKb) break;
    kbBlocks.push(block);
    used += block.length;
  }

  let newsBlock = "";
  let newsArticlesUsed = 0;
  let newsQuery = "";

  if (input.news?.enabled) {
    newsQuery = deriveNewsQuery(input.task, input.news.query);
    const searchResult = await searchNews({
      query: newsQuery,
      recencyDays: input.news.recencyDays,
      sortBy: input.news.sortBy,
      mode: input.news.mode,
      category: input.news.category,
      domains: input.news.domains,
      pageSize: input.news.pageSize,
    });
    const articles = filterArticlesByIds(searchResult.articles, input.news.articleIds);
    newsArticlesUsed = articles.length;
    newsQuery = searchResult.query;
    newsBlock = buildNewsPromptBlock(articles);
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

  const kbSection =
    kbBlocks.length > 0
      ? `KNOWLEDGE BASE EXCERPTS (cite by [title · p.N]):\n${kbBlocks.join("\n")}`
      : "KNOWLEDGE BASE EXCERPTS:\n(none selected)";

  const newsSection = newsBlock
    ? `\n\n${newsBlock}`
    : input.news?.enabled
      ? "\n\nRECENT NEWS:\n(none found for query)"
      : "";

  const userMsg = `TASK:
${input.task}

ADDITIONAL CONTEXT FROM EDITOR:
${input.extraContext || "(none)"}${followUpBlock}

${kbSection}${newsSection}`;

  const output = await ai.chat({ system, user: userMsg, model });

  await saveGeneration({
    module: input.module,
    prompt: {
      task: input.task,
      extraContext: input.extraContext,
      model,
      followUp: input.followUp,
      news: input.news,
    },
    output_md: output,
    document_ids: input.documentIds,
  });

  return {
    output,
    model,
    kbCharsUsed: used,
    blocks: kbBlocks.length,
    newsArticlesUsed,
    newsQuery,
  };
}
