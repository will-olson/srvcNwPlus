import { getDocumentProxy, extractText } from "unpdf";

export async function extractPdfText(bytes: Uint8Array): Promise<{ page: number; text: string }[]> {
  const pdf = await getDocumentProxy(bytes);
  const { text: perPage } = await extractText(pdf);
  return (Array.isArray(perPage) ? perPage : [perPage]).map((t, i) => ({
    page: i + 1,
    text: (t ?? "").replace(/\s+/g, " ").trim(),
  }));
}

export async function extractMarkdownText(bytes: Uint8Array): Promise<{ page: number; text: string }[]> {
  const text = new TextDecoder().decode(bytes).trim();
  return [{ page: 1, text }];
}

export async function extractDocxText(bytes: Uint8Array): Promise<{ page: number; text: string }[]> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
  const text = (result.value ?? "").replace(/\s+/g, " ").trim();
  return [{ page: 1, text }];
}

export function detectMime(filename: string, declared?: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "text/markdown";
  if (lower.endsWith(".docx"))
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return declared ?? "application/octet-stream";
}

export async function extractByMime(
  mime: string,
  bytes: Uint8Array,
): Promise<{ page: number; text: string }[]> {
  if (mime === "application/pdf") return extractPdfText(bytes);
  if (mime === "text/markdown" || mime === "text/plain") return extractMarkdownText(bytes);
  if (
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mime === "application/msword"
  ) {
    return extractDocxText(bytes);
  }
  throw new Error(`Unsupported file type: ${mime}. Upload PDF, Markdown, or DOCX.`);
}
