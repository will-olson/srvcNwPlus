import { describe, expect, it } from "vitest";
import { SEED_FILES } from "@/config/cluster-workspaces";
import {
  getCompetitiveSeedDocs,
  getUploadDocs,
  validateDocumentSelection,
  validateGenerationDocuments,
} from "./selection-policy";
import type { KbDocument } from "./types";

function doc(partial: Partial<KbDocument> & Pick<KbDocument, "id" | "filename" | "is_seed">): KbDocument {
  return {
    title: partial.title ?? partial.filename,
    storage_path: "x.md",
    mime: "text/markdown",
    byte_size: 100,
    page_count: 1,
    status: "ready",
    summary: null,
    created_at: new Date().toISOString(),
    cluster: partial.cluster ?? null,
    doc_series: null,
    ...partial,
  };
}

const echelonPersonas = doc({
  id: "1",
  filename: SEED_FILES.echelonPersonas,
  is_seed: true,
  cluster: "echelon",
});
const echelonVerticals = doc({
  id: "2",
  filename: SEED_FILES.echelonVerticals,
  is_seed: true,
  cluster: "echelon",
});
const profound = doc({
  id: "3",
  filename: SEED_FILES.profoundGtm,
  is_seed: true,
  cluster: "profound",
});
const echelonCompetitive = doc({
  id: "4",
  filename: SEED_FILES.echelonCompetitive,
  is_seed: true,
  cluster: "echelon",
});
const monteCompetitive = doc({
  id: "5",
  filename: SEED_FILES.monteCarloCompetitive,
  is_seed: true,
  cluster: "monte-carlo",
});
const upload = doc({ id: "6", filename: "my-upload.md", is_seed: false, cluster: null });

describe("selection-policy", () => {
  it("rejects mixing uploads with seeds", () => {
    const result = validateGenerationDocuments("persona", [echelonPersonas, upload]);
    expect(result.ok).toBe(false);
  });

  it("rejects cross-cluster seeds for non-competitive modules", () => {
    const result = validateGenerationDocuments("persona", [echelonPersonas, profound]);
    expect(result.ok).toBe(false);
  });

  it("allows cross-cluster competitive docs for battlecard", () => {
    const result = validateGenerationDocuments("battlecard", [echelonCompetitive, monteCompetitive]);
    expect(result.ok).toBe(true);
  });

  it("validates echelon workspace single cluster", () => {
    const ok = validateDocumentSelection("echelon", "persona", [echelonPersonas]);
    expect(ok.ok).toBe(true);

    const bad = validateDocumentSelection("echelon", "persona", [profound]);
    expect(bad.ok).toBe(false);
  });

  it("validates uploads workspace is upload-only", () => {
    expect(validateDocumentSelection("uploads", "persona", [upload]).ok).toBe(true);
    expect(validateDocumentSelection("uploads", "persona", [echelonPersonas]).ok).toBe(false);
  });

  it("filters competitive and upload docs", () => {
    const all = [echelonPersonas, echelonCompetitive, monteCompetitive, profound, upload];
    expect(getCompetitiveSeedDocs(all)).toHaveLength(3);
    expect(getUploadDocs(all)).toHaveLength(1);
  });

  it("rejects mixing echelon persona and verticals in echelon workspace when both selected", () => {
    const result = validateDocumentSelection("echelon", "persona", [echelonPersonas, echelonVerticals]);
    expect(result.ok).toBe(false);
  });
});
