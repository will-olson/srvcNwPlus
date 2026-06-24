import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getEnvStatus } from "@/lib/env";
import { distillDocument } from "@/lib/kb/distill";
import { detectMime, extractByMime } from "@/lib/kb/ingest";
import { validateGenerationDocuments } from "@/lib/kb/selection-policy";
import {
  deleteDocument,
  listDocuments,
  listGenerations,
  saveDocument,
  updateDocumentSummary,
} from "@/lib/kb/store";
import { runGroundedGeneration } from "@/lib/generate";
import { searchNews } from "@/lib/news/search";
import type { KbDocument } from "@/lib/kb/types";

export type { KbDocument };

export const listKbDocuments = createServerFn({ method: "GET" }).handler(async () => {
  return listDocuments();
});

export const getServiceStatus = createServerFn({ method: "GET" }).handler(async () => {
  return getEnvStatus();
});

const uploadSchema = z.object({
  title: z.string().trim().min(1).max(200),
  filename: z.string().trim().min(1).max(200),
  mime: z.string().optional(),
  base64: z.string().min(1),
});

export const uploadKbDocument = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => uploadSchema.parse(d))
  .handler(async ({ data }) => {
    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    const mime = detectMime(data.filename, data.mime);
    const pages = await extractByMime(mime, bytes);
    if (!pages.some((p) => p.text.trim())) {
      throw new Error("No extractable text found in document.");
    }

    const saved = await saveDocument({
      title: data.title,
      filename: data.filename,
      mime,
      bytes,
      pages,
    });

    const { summary, summarySource } = await distillDocument({
      documentId: saved.id,
      title: data.title,
      pages,
    });
    await updateDocumentSummary(saved.id, summary.slice(0, 2000));

    return { ...saved, summaryLength: summary.length, summarySource };
  });

export const deleteKbDocument = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    await deleteDocument(data.id);
    return { ok: true };
  });

const newsSchema = z.object({
  enabled: z.boolean(),
  query: z.string().max(500).optional(),
  recencyDays: z.enum(["7", "30", "90"]).optional(),
  sortBy: z.enum(["relevancy", "publishedAt"]).optional(),
  mode: z.enum(["everything", "top-headlines"]).optional(),
  category: z.enum(["business", "technology", "general"]).optional(),
  domains: z.string().max(200).optional(),
  pageSize: z.number().int().min(1).max(20).optional(),
  articleIds: z.array(z.string()).max(20).optional(),
});

const generateSchema = z
  .object({
    module: z.string().min(1).max(50),
    documentIds: z.array(z.string().uuid()).max(20),
    task: z.string().min(10).max(5000),
    extraContext: z.string().max(8000).optional().or(z.literal("")),
    model: z.string().optional(),
    maxKbChars: z.number().int().min(2000).max(400000).optional(),
    includeVoice: z.boolean().optional(),
    includeWiki: z.boolean().optional(),
    priorOutput: z.string().max(50000).optional(),
    followUp: z.string().max(4000).optional(),
    news: newsSchema.optional(),
  })
  .superRefine((data, ctx) => {
    const hasKb = data.documentIds.length > 0;
    const hasNews = data.news?.enabled === true;
    if (!hasKb && !hasNews) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one KB source or enable recent news",
        path: ["documentIds"],
      });
    }
    if (hasNews && data.news?.mode !== "top-headlines" && !data.news?.query?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "News search query is required for keyword search mode",
        path: ["news", "query"],
      });
    }
  });

export const searchNewsArticles = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        query: z.string().max(500).optional(),
        recencyDays: z.enum(["7", "30", "90"]).optional(),
        sortBy: z.enum(["relevancy", "publishedAt"]).optional(),
        mode: z.enum(["everything", "top-headlines"]).optional(),
        category: z.enum(["business", "technology", "general"]).optional(),
        domains: z.string().max(200).optional(),
        pageSize: z.number().int().min(1).max(20).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    if (data.mode !== "top-headlines" && !data.query?.trim()) {
      throw new Error("News search query is required for keyword search mode");
    }
    return searchNews({
      query: data.query,
      recencyDays: data.recencyDays,
      sortBy: data.sortBy,
      mode: data.mode,
      category: data.category,
      domains: data.domains,
      pageSize: data.pageSize,
    });
  });

export const generateGrounded = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => generateSchema.parse(d))
  .handler(async ({ data }) => {
    if (data.documentIds.length > 0) {
      const docs = await listDocuments();
      const selected = docs.filter((d) => data.documentIds.includes(d.id));
      const validation = validateGenerationDocuments(data.module, selected);
      if (!validation.ok) {
        throw new Error(validation.message);
      }
    }
    return runGroundedGeneration(data);
  });

export const listGenerationHistory = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ module: z.string().min(1).max(50) }).parse(d))
  .handler(async ({ data }) => listGenerations(data.module));
