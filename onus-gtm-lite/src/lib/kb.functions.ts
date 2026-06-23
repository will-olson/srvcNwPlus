import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { distillDocument } from "@/lib/kb/distill";
import { detectMime, extractByMime } from "@/lib/kb/ingest";
import {
  deleteDocument,
  listDocuments,
  listGenerations,
  saveDocument,
  updateDocumentSummary,
} from "@/lib/kb/store";
import { runGroundedGeneration } from "@/lib/generate";
import type { KbDocument } from "@/lib/kb/types";

export type { KbDocument };

export const listKbDocuments = createServerFn({ method: "GET" }).handler(async () => {
  return listDocuments();
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

    const { summary } = await distillDocument({
      documentId: saved.id,
      title: data.title,
      pages,
    });
    await updateDocumentSummary(saved.id, summary.slice(0, 2000));

    return { ...saved, summaryLength: summary.length };
  });

export const deleteKbDocument = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    await deleteDocument(data.id);
    return { ok: true };
  });

const generateSchema = z.object({
  module: z.string().min(1).max(50),
  documentIds: z.array(z.string().uuid()).min(1).max(20),
  task: z.string().min(10).max(5000),
  extraContext: z.string().max(8000).optional().or(z.literal("")),
  model: z.string().optional(),
  maxKbChars: z.number().int().min(2000).max(400000).optional(),
  includeVoice: z.boolean().optional(),
  includeWiki: z.boolean().optional(),
  priorOutput: z.string().max(50000).optional(),
  followUp: z.string().max(4000).optional(),
});

export const generateGrounded = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => generateSchema.parse(d))
  .handler(async ({ data }) => runGroundedGeneration(data));

export const listGenerationHistory = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ module: z.string().min(1).max(50) }).parse(d))
  .handler(async ({ data }) => listGenerations(data.module));
