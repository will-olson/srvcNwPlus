import { getDocumentProxy, extractText } from "unpdf";
import type { MarkdownPage } from "./types";

const PAGE_CHAR_BUDGET = 4000;

function cleanHeading(raw: string): string {
  return raw.replace(/\\./g, ".").replace(/\*\*/g, "").trim();
}

function buildHeadingPath(stack: { level: number; heading: string }[]): string {
  return stack.map((s) => s.heading).join(" > ");
}

export function parseMarkdownSections(raw: string): MarkdownPage[] {
  const trimmed = raw.trim();
  if (!trimmed) return [{ page: 1, text: "" }];

  const lines = trimmed.split("\n");
  type Section = { level: number; heading: string; headingPath: string; lines: string[]; sectionOrd: number };
  const sections: Section[] = [];
  const headingStack: { level: number; heading: string }[] = [];
  let current: Section | null = null;
  let sectionOrd = 0;

  const pushCurrent = () => {
    if (current && current.lines.join("\n").trim()) {
      sections.push(current);
    }
  };

  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)/);
    if (match) {
      pushCurrent();
      const level = match[1].length;
      const heading = cleanHeading(match[2]);

      while (headingStack.length > 0 && headingStack[headingStack.length - 1].level >= level) {
        headingStack.pop();
      }
      headingStack.push({ level, heading });

      current = {
        level,
        heading,
        headingPath: buildHeadingPath(headingStack),
        lines: [line],
        sectionOrd: sectionOrd++,
      };
    } else if (current) {
      current.lines.push(line);
    } else {
      current = {
        level: 0,
        heading: "Introduction",
        headingPath: "Introduction",
        lines: [line],
        sectionOrd: sectionOrd++,
      };
    }
  }
  pushCurrent();

  if (sections.length === 0) {
    return [{ page: 1, text: trimmed }];
  }

  const pages: MarkdownPage[] = [];
  let pageNum = 1;
  let pageText = "";
  let pageHeadingPath = sections[0].headingPath;
  let pageSectionOrd = sections[0].sectionOrd;

  for (const section of sections) {
    const sectionText = section.lines.join("\n").trim();
    if (!sectionText) continue;

    const separator = pageText ? "\n\n" : "";
    if (pageText.length + separator.length + sectionText.length > PAGE_CHAR_BUDGET && pageText.length > 0) {
      pages.push({
        page: pageNum++,
        text: pageText,
        heading_path: pageHeadingPath,
        section_ord: pageSectionOrd,
      });
      pageText = sectionText;
      pageHeadingPath = section.headingPath;
      pageSectionOrd = section.sectionOrd;
    } else {
      if (!pageText) {
        pageHeadingPath = section.headingPath;
        pageSectionOrd = section.sectionOrd;
      }
      pageText += separator + sectionText;
    }
  }

  if (pageText) {
    pages.push({
      page: pageNum,
      text: pageText,
      heading_path: pageHeadingPath,
      section_ord: pageSectionOrd,
    });
  }

  return pages;
}

export async function extractPdfText(bytes: Uint8Array): Promise<MarkdownPage[]> {
  const pdf = await getDocumentProxy(bytes);
  const { text: perPage } = await extractText(pdf);
  return (Array.isArray(perPage) ? perPage : [perPage]).map((t, i) => ({
    page: i + 1,
    text: (t ?? "").replace(/\s+/g, " ").trim(),
  }));
}

export async function extractMarkdownText(bytes: Uint8Array): Promise<MarkdownPage[]> {
  const text = new TextDecoder().decode(bytes).trim();
  return parseMarkdownSections(text);
}

export async function extractDocxText(bytes: Uint8Array): Promise<MarkdownPage[]> {
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

export async function extractByMime(mime: string, bytes: Uint8Array): Promise<MarkdownPage[]> {
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
