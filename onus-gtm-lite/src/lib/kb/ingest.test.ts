import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { chunkText } from "./store";
import { extractMarkdownText, parseMarkdownSections } from "./ingest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = path.resolve(
  __dirname,
  "../../../../knowledgeBaseDocs/echelonFoundations-competitivePositioning_v1_WO_6.23.26 (1).md",
);

describe("markdown ingest", () => {
  it("parses competitive positioning doc into multiple virtual pages", async () => {
    const bytes = new Uint8Array(await fs.readFile(FIXTURE_PATH));
    const pages = await extractMarkdownText(bytes);

    expect(pages.length).toBeGreaterThan(1);
    expect(pages.some((p) => p.heading_path && p.heading_path.length > 0)).toBe(true);
  });

  it("preserves total text content through section parsing", async () => {
    const raw = await fs.readFile(FIXTURE_PATH, "utf8");
    const pages = parseMarkdownSections(raw.trim());
    const combined = pages.map((p) => p.text).join("\n\n");

    expect(combined.replace(/\s+/g, " ").length).toBeGreaterThan(raw.trim().length * 0.9);
  });

  it("chunks with heading_path metadata", async () => {
    const bytes = new Uint8Array(await fs.readFile(FIXTURE_PATH));
    const pages = await extractMarkdownText(bytes);
    const chunks = chunkText("test-doc-id", pages);

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.some((c) => c.heading_path)).toBe(true);
    expect(chunks.every((c) => c.document_id === "test-doc-id")).toBe(true);
  });
});

describe("echelon personas scale", () => {
  it("produces many chunks across pages for large persona doc", async () => {
    const personaPath = path.resolve(
      __dirname,
      "../../../../knowledgeBaseDocs/echelonPersonas_v1_WO_6.23.26.md",
    );
    const bytes = new Uint8Array(await fs.readFile(personaPath));
    const pages = await extractMarkdownText(bytes);
    const chunks = chunkText("persona-doc", pages);

    expect(pages.length).toBeGreaterThan(10);
    expect(chunks.length).toBeGreaterThanOrEqual(pages.length);
    expect(chunks.some((c) => c.heading_path)).toBe(true);
  });
});
