import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  getDataDir,
  getDistillatesDir,
  getDocumentsDir,
  getSeedsPath,
} from "@/lib/paths";
import type {
  BrandContext,
  DocumentDistillate,
  GenerationRecord,
  KbChunk,
  KbDocument,
  MarkdownPage,
} from "./types";

const CHUNK_SIZE = 4500;

async function ensureDirs() {
  await fs.mkdir(getDocumentsDir(), { recursive: true });
  await fs.mkdir(path.join(getDataDir(), "seeds"), { recursive: true });
  await fs.mkdir(getDistillatesDir(), { recursive: true });
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown) {
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

function indexPath() {
  return path.join(getDataDir(), "documents-index.json");
}

function chunksPath() {
  return path.join(getDataDir(), "chunks.json");
}

function generationsPath() {
  return path.join(getDataDir(), "generations.json");
}

function distillatePath(documentId: string) {
  return path.join(getDistillatesDir(), `${documentId}.json`);
}

export function chunkText(documentId: string, pages: MarkdownPage[]): KbChunk[] {
  const chunks: KbChunk[] = [];
  let ord = 0;

  for (const { page, text, heading_path, section_ord } of pages) {
    if (!text) continue;

    const prefix = heading_path ? `## ${heading_path}\n\n` : "";
    const body = text.trim();
    const fullText = prefix + body;

    if (fullText.length <= CHUNK_SIZE) {
      chunks.push({
        id: randomUUID(),
        document_id: documentId,
        ord: ord++,
        page,
        content: fullText,
        token_estimate: Math.ceil(fullText.length / 4),
        heading_path,
        section_ord,
      });
      continue;
    }

    let offset = 0;
    while (offset < body.length) {
      const slice = body.slice(offset, offset + CHUNK_SIZE);
      const chunkContent = offset === 0 ? prefix + slice : slice;
      chunks.push({
        id: randomUUID(),
        document_id: documentId,
        ord: ord++,
        page,
        content: chunkContent,
        token_estimate: Math.ceil(chunkContent.length / 4),
        heading_path,
        section_ord,
      });
      offset += CHUNK_SIZE;
    }
  }

  return chunks;
}

export async function listDocuments(): Promise<KbDocument[]> {
  await ensureDirs();
  const docs = await readJson<KbDocument[]>(indexPath(), []);
  return docs.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export async function getDocument(id: string): Promise<KbDocument | null> {
  const docs = await listDocuments();
  return docs.find((d) => d.id === id) ?? null;
}

export async function findSeedByFilename(filename: string): Promise<KbDocument | null> {
  const docs = await listDocuments();
  return docs.find((d) => d.is_seed && d.filename === filename) ?? null;
}

export async function listAllChunks(): Promise<KbChunk[]> {
  return readJson<KbChunk[]>(chunksPath(), []);
}

export async function getChunksForDocuments(documentIds: string[]): Promise<KbChunk[]> {
  const all = await listAllChunks();
  const set = new Set(documentIds);
  return all
    .filter((c) => set.has(c.document_id))
    .sort((a, b) => a.document_id.localeCompare(b.document_id) || a.ord - b.ord);
}

export async function loadDistillate(documentId: string): Promise<DocumentDistillate | null> {
  return readJson<DocumentDistillate | null>(distillatePath(documentId), null);
}

export async function saveDistillate(distillate: DocumentDistillate): Promise<void> {
  await ensureDirs();
  await writeJson(distillatePath(distillate.document_id), distillate);
}

type SaveDocumentParams = {
  title: string;
  filename: string;
  mime: string;
  bytes: Uint8Array;
  pages: MarkdownPage[];
  is_seed?: boolean;
  summary?: string | null;
  cluster?: string | null;
  doc_series?: string | null;
};

async function persistDocument(params: SaveDocumentParams): Promise<{ id: string; pages: number; chunks: number }> {
  await ensureDirs();
  const id = randomUUID();
  const ext = path.extname(params.filename) || ".bin";
  const storagePath = `${id}${ext}`;
  const fullPath = path.join(getDocumentsDir(), storagePath);
  await fs.writeFile(fullPath, params.bytes);

  const doc: KbDocument = {
    id,
    title: params.title,
    filename: params.filename,
    storage_path: storagePath,
    mime: params.mime,
    byte_size: params.bytes.byteLength,
    page_count: params.pages.length || 1,
    status: "ready",
    is_seed: params.is_seed ?? false,
    summary: params.summary ?? null,
    cluster: params.cluster ?? null,
    doc_series: params.doc_series ?? null,
    created_at: new Date().toISOString(),
  };

  const docs = await listDocuments();
  docs.unshift(doc);
  await writeJson(indexPath(), docs);

  const newChunks = chunkText(id, params.pages);
  const existing = await listAllChunks();
  await writeJson(chunksPath(), [...existing, ...newChunks]);

  return { id, pages: doc.page_count ?? 0, chunks: newChunks.length };
}

export async function saveDocument(params: Omit<SaveDocumentParams, "is_seed">) {
  return persistDocument({ ...params, is_seed: false });
}

export async function saveSeedDocument(
  params: Omit<SaveDocumentParams, "is_seed">,
): Promise<{ id: string; pages: number; chunks: number; skipped: boolean }> {
  const existing = await findSeedByFilename(params.filename);
  if (existing) {
    return {
      id: existing.id,
      pages: existing.page_count ?? 0,
      chunks: (await getChunksForDocuments([existing.id])).length,
      skipped: true,
    };
  }
  const result = await persistDocument({ ...params, is_seed: true });
  return { ...result, skipped: false };
}

export async function deleteDocument(id: string): Promise<void> {
  const docs = await listDocuments();
  const doc = docs.find((d) => d.id === id);
  if (!doc) throw new Error("Document not found");
  if (doc.is_seed) throw new Error("Seed documents cannot be deleted");

  try {
    await fs.unlink(path.join(getDocumentsDir(), doc.storage_path));
  } catch {
    /* ignore missing file */
  }

  try {
    await fs.unlink(distillatePath(id));
  } catch {
    /* ignore missing distillate */
  }

  await writeJson(
    indexPath(),
    docs.filter((d) => d.id !== id),
  );
  const chunks = await listAllChunks();
  await writeJson(
    chunksPath(),
    chunks.filter((c) => c.document_id !== id),
  );
}

export async function loadBrandContext(): Promise<BrandContext> {
  const fallback: BrandContext = {
    voice_rules: [],
    brand_wiki_sections: [],
    content_pillars: [],
    personas: [],
  };
  return readJson(getSeedsPath(), fallback);
}

export async function listGenerations(module: string): Promise<GenerationRecord[]> {
  const all = await readJson<GenerationRecord[]>(generationsPath(), []);
  return all
    .filter((g) => g.module === module)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 25);
}

export async function saveGeneration(record: Omit<GenerationRecord, "id" | "created_at">) {
  const all = await readJson<GenerationRecord[]>(generationsPath(), []);
  const entry: GenerationRecord = {
    ...record,
    id: randomUUID(),
    created_at: new Date().toISOString(),
  };
  all.unshift(entry);
  await writeJson(generationsPath(), all.slice(0, 500));
  return entry;
}

export async function findDocumentsByFilenames(filenames: string[]): Promise<KbDocument[]> {
  const docs = await listDocuments();
  const set = new Set(filenames);
  return docs.filter((d) => set.has(d.filename));
}

export async function updateDocumentSummary(documentId: string, summary: string): Promise<void> {
  const docs = await listDocuments();
  const idx = docs.findIndex((d) => d.id === documentId);
  if (idx === -1) return;
  docs[idx] = { ...docs[idx], summary };
  await writeJson(indexPath(), docs);
}
