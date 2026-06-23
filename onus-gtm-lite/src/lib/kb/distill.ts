import { createAiProvider, getDefaultModel } from "@/lib/ai/provider";
import type { DocumentDistillate, MarkdownPage, SectionIndexEntry } from "./types";
import { saveDistillate } from "./store";

const STOP_WORDS = new Set([
  "that",
  "this",
  "with",
  "from",
  "have",
  "will",
  "their",
  "they",
  "about",
  "which",
  "when",
  "where",
  "what",
  "your",
  "into",
  "more",
  "than",
  "also",
  "been",
  "being",
  "these",
  "those",
  "such",
  "each",
  "other",
  "should",
  "would",
  "could",
  "document",
  "section",
]);

function extractKeywords(text: string, limit = 8): string[] {
  const counts = new Map<string, number>();
  for (const word of text.toLowerCase().match(/[a-z][a-z0-9-]{3,}/g) ?? []) {
    if (STOP_WORDS.has(word)) continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

function findSectionText(pages: MarkdownPage[], pattern: RegExp): string | undefined {
  for (const page of pages) {
    const lines = page.text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        const slice = lines.slice(i, i + 12).join("\n").trim();
        return slice.slice(0, 1200);
      }
    }
  }
  return undefined;
}

function buildSectionIndex(pages: MarkdownPage[]): SectionIndexEntry[] {
  const index: SectionIndexEntry[] = [];
  let charOffset = 0;

  for (const page of pages) {
    const heading = page.heading_path ?? `Page ${page.page}`;
    const text = page.text.trim();
    const start = charOffset;
    const end = charOffset + text.length;
    index.push({
      heading,
      page: page.page,
      char_start: start,
      char_end: end,
      keywords: extractKeywords(text),
    });
    charOffset = end + 2;
  }

  return index;
}

function buildHeuristicSummary(
  title: string,
  purpose?: string,
  category?: string,
  sectionIndex?: SectionIndexEntry[],
): string {
  const parts = [`# ${title}`];
  if (purpose) parts.push(`## Purpose\n${purpose}`);
  if (category) parts.push(`## Category\n${category}`);
  if (sectionIndex?.length) {
    const topSections = sectionIndex.slice(0, 8).map((s) => `- ${s.heading} (p.${s.page})`);
    parts.push(`## Section index\n${topSections.join("\n")}`);
  }
  return parts.join("\n\n");
}

export type DistillInput = {
  documentId: string;
  title: string;
  pages: MarkdownPage[];
  doc_series?: string | null;
};

export type DistillResult = {
  summary: string;
  distillate: DocumentDistillate;
};

export async function distillDocument(input: DistillInput): Promise<DistillResult> {
  const purpose =
    findSectionText(input.pages, /purpose of this document/i) ??
    findSectionText(input.pages, /executive read/i);
  const category =
    findSectionText(input.pages, /category definition/i) ??
    findSectionText(input.pages, /real market category/i);

  const section_index = buildSectionIndex(input.pages);
  const key_claims = section_index
    .flatMap((s) => s.keywords.slice(0, 2))
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 10);

  let summary = buildHeuristicSummary(input.title, purpose, category, section_index);
  let llmClaims: string[] | undefined;

  if (process.env.DISTILL_ON_INGEST === "true") {
    try {
      const ai = await createAiProvider();
      const model = getDefaultModel();
      const sample = input.pages
        .slice(0, 6)
        .map((p) => `[p.${p.page}] ${p.text.slice(0, 1500)}`)
        .join("\n\n");

      const llmSummary = await ai.chat({
        system:
          "Summarize this GTM knowledge-base document in ~400 words. Include 5-10 bullet key claims with [p.N] section refs. Do not invent facts.",
        user: `Document: ${input.title}\n\n${sample}`,
        model,
      });

      summary = llmSummary;
      llmClaims = llmSummary
        .split("\n")
        .filter((line) => line.trim().startsWith("-") || line.trim().startsWith("*"))
        .map((line) => line.replace(/^[-*]\s*/, "").trim())
        .slice(0, 10);
    } catch {
      /* fall back to heuristic summary */
    }
  }

  const distillate: DocumentDistillate = {
    document_id: input.documentId,
    purpose,
    category,
    doc_series: input.doc_series ?? null,
    section_index,
    summary,
    key_claims: llmClaims ?? key_claims,
  };

  await saveDistillate(distillate);

  return { summary, distillate };
}

export function formatDistillatesForPrompt(
  distillates: DocumentDistillate[],
  docTitles: Map<string, string>,
  maxChars = 20_000,
): string {
  const blocks: string[] = [];
  let used = 0;

  for (const d of distillates) {
    const title = docTitles.get(d.document_id) ?? d.document_id;
    const block = `### Distillate: ${title}\n${d.summary ?? ""}\n`;
    if (used + block.length > maxChars) break;
    blocks.push(block);
    used += block.length;
  }

  return blocks.join("\n");
}

export function scoreChunkAgainstTask(content: string, task: string): number {
  const terms = task
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length > 3 && !STOP_WORDS.has(t));
  if (terms.length === 0) return 0;

  const haystack = content.toLowerCase();
  let score = 0;
  for (const term of terms) {
    if (haystack.includes(term)) score += 1;
  }
  return score;
}

export function rankChunksByTask<T extends { content: string; ord: number }>(
  chunks: T[],
  task: string,
  documentCount: number,
): T[] {
  if (documentCount <= 3) return chunks;
  return [...chunks].sort((a, b) => {
    const diff = scoreChunkAgainstTask(b.content, task) - scoreChunkAgainstTask(a.content, task);
    return diff !== 0 ? diff : a.ord - b.ord;
  });
}
