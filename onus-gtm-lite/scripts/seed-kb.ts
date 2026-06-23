import fs from "node:fs/promises";
import path from "node:path";
import { detectMime, extractByMime } from "../src/lib/kb/ingest.js";
import { distillDocument } from "../src/lib/kb/distill.js";
import {
  findSeedByFilename,
  saveSeedDocument,
  updateDocumentSummary,
} from "../src/lib/kb/store.js";
import type { KbManifestEntry } from "../src/lib/kb/types.js";
import {
  getDefaultKbSeedDir,
  getKbManifestPath,
} from "../src/lib/paths.js";

async function loadManifest(): Promise<Record<string, KbManifestEntry>> {
  try {
    const raw = await fs.readFile(getKbManifestPath(), "utf8");
    return JSON.parse(raw) as Record<string, KbManifestEntry>;
  } catch {
    return {};
  }
}

function deriveTitle(filename: string, manifest?: KbManifestEntry): string {
  if (manifest?.title) return manifest.title;
  return filename
    .replace(/\s*\(\d+\)/, "")
    .replace(/\.md$/i, "")
    .replace(/_/g, " ")
    .replace(/v\d+/i, "")
    .replace(/WO-[\d.]+/i, "")
    .trim();
}

export async function seedKnowledgeBase(kbDir?: string): Promise<void> {
  const sourceDir = kbDir ?? process.env.KB_SEED_DIR ?? getDefaultKbSeedDir();
  const manifest = await loadManifest();

  let entries: string[];
  try {
    entries = await fs.readdir(sourceDir);
  } catch {
    throw new Error(`KB seed directory not found: ${sourceDir}`);
  }

  const mdFiles = entries.filter((f) => f.toLowerCase().endsWith(".md")).sort();
  if (mdFiles.length === 0) {
    console.warn(`No markdown files found in ${sourceDir}`);
    return;
  }

  let seeded = 0;
  let skipped = 0;

  for (const filename of mdFiles) {
    const meta = manifest[filename];
    const existing = await findSeedByFilename(filename);
    if (existing) {
      console.log(`skip  ${filename} (already seeded)`);
      skipped++;
      continue;
    }

    const fullPath = path.join(sourceDir, filename);
    const bytes = new Uint8Array(await fs.readFile(fullPath));
    const mime = detectMime(filename);
    const pages = await extractByMime(mime, bytes);

    if (!pages.some((p) => p.text.trim())) {
      console.warn(`skip  ${filename} (no extractable text)`);
      continue;
    }

    const result = await saveSeedDocument({
      title: deriveTitle(filename, meta),
      filename,
      mime,
      bytes,
      pages,
      cluster: meta?.cluster ?? null,
      doc_series: meta?.series ?? null,
    });

    const { summary } = await distillDocument({
      documentId: result.id,
      title: deriveTitle(filename, meta),
      pages,
      doc_series: meta?.series ?? null,
    });
    await updateDocumentSummary(result.id, summary.slice(0, 2000));

    console.log(
      `seed  ${filename} → ${result.pages} pages, ${result.chunks} chunks, summary ${summary.length} chars`,
    );
    seeded++;
  }

  console.log(`\nDone: ${seeded} seeded, ${skipped} skipped (${mdFiles.length} total markdown files)`);
}

const isMain = process.argv[1]?.includes("seed-kb");
if (isMain) {
  seedKnowledgeBase(process.env.KB_SEED_DIR).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
