import {
  COMPETITIVE_CROSS_CLUSTER_FILENAMES,
  COMPETITIVE_MODULES,
  type WorkspaceId,
} from "@/config/cluster-workspaces";
import type { KbDocument } from "./types";

export function isCompetitiveModule(module: string): boolean {
  return COMPETITIVE_MODULES.has(module);
}

export function isCompetitiveClassSeed(filename: string): boolean {
  return COMPETITIVE_CROSS_CLUSTER_FILENAMES.includes(filename);
}

export function getCompetitiveSeedDocs(docs: KbDocument[]): KbDocument[] {
  return docs.filter((d) => d.is_seed && isCompetitiveClassSeed(d.filename));
}

export function getUploadDocs(docs: KbDocument[]): KbDocument[] {
  return docs.filter((d) => !d.is_seed);
}

export function getClusterSeedDocs(docs: KbDocument[], cluster: string): KbDocument[] {
  return docs.filter((d) => d.is_seed && d.cluster === cluster);
}

export function resolveTemplateSources(
  documentFilenames: string[] | undefined,
  docs: KbDocument[],
): Set<string> {
  if (!documentFilenames?.length) return new Set();
  const names = new Set(documentFilenames);
  return new Set(docs.filter((d) => names.has(d.filename)).map((d) => d.id));
}

export type SelectionValidation = { ok: true } | { ok: false; message: string };

export function validateDocumentSelection(
  workspace: WorkspaceId,
  module: string,
  selectedDocs: KbDocument[],
): SelectionValidation {
  if (selectedDocs.length === 0) {
    return { ok: false, message: "Select at least one source document" };
  }

  const seeds = selectedDocs.filter((d) => d.is_seed);
  const uploads = selectedDocs.filter((d) => !d.is_seed);

  if (seeds.length > 0 && uploads.length > 0) {
    return { ok: false, message: "Cannot mix uploaded files with seed knowledge base documents" };
  }

  if (workspace === "uploads") {
    if (seeds.length > 0) {
      return { ok: false, message: "My Uploads workspace can only use uploaded documents" };
    }
    return { ok: true };
  }

  if (uploads.length > 0) {
    return { ok: false, message: "Seed workspaces cannot use uploaded documents" };
  }

  if (seeds.length > 1 && !isCompetitiveModule(module)) {
    return {
      ok: false,
      message: "Use a single seed document per artifact, or switch to the Competitive workspace for multi-source drafts",
    };
  }

  const clusters = new Set(seeds.map((d) => d.cluster).filter(Boolean));

  if (workspace === "competitive") {
    if (!seeds.every((d) => isCompetitiveClassSeed(d.filename))) {
      return {
        ok: false,
        message: "Competitive workspace only allows cross-cluster competitive positioning documents",
      };
    }
    if (!isCompetitiveModule(module)) {
      return { ok: false, message: "Competitive workspace requires a competitive artifact template" };
    }
    return { ok: true };
  }

  if (clusters.size > 1) {
    return {
      ok: false,
      message: "Cannot mix seed documents from different product workspaces",
    };
  }

  const expectedCluster = workspace === "monte-carlo" ? "monte-carlo" : workspace;
  if (seeds.some((d) => d.cluster && d.cluster !== expectedCluster)) {
    return {
      ok: false,
      message: `Selected documents must belong to the ${expectedCluster} workspace`,
    };
  }

  if (clusters.size > 1 && !isCompetitiveModule(module)) {
    return {
      ok: false,
      message: "Cross-cluster seed mixing is only allowed for competitive artifacts",
    };
  }

  return { ok: true };
}

export function validateGenerationDocuments(
  module: string,
  selectedDocs: KbDocument[],
): SelectionValidation {
  const seeds = selectedDocs.filter((d) => d.is_seed);
  const uploads = selectedDocs.filter((d) => !d.is_seed);

  if (seeds.length > 0 && uploads.length > 0) {
    return { ok: false, message: "Cannot mix uploaded files with seed knowledge base documents" };
  }

  if (seeds.length > 1 && !isCompetitiveModule(module)) {
    return {
      ok: false,
      message: "Use a single seed document per artifact, or switch to the Competitive workspace for multi-source drafts",
    };
  }

  const clusters = new Set(seeds.map((d) => d.cluster).filter(Boolean));

  if (clusters.size > 1) {
    if (!isCompetitiveModule(module)) {
      return {
        ok: false,
        message: "Cannot mix seed documents from different product workspaces except in competitive artifacts",
      };
    }
    if (!seeds.every((d) => isCompetitiveClassSeed(d.filename))) {
      return {
        ok: false,
        message: "Cross-cluster mixing is limited to competitive positioning documents",
      };
    }
  }

  return { ok: true };
}

export function toggleCompetitiveSelection(
  current: Set<string>,
  docId: string,
  competitiveDocIds: Set<string>,
): Set<string> {
  if (!competitiveDocIds.has(docId)) return current;
  const next = new Set(current);
  if (next.has(docId)) next.delete(docId);
  else next.add(docId);
  return next;
}

export function toggleUploadSelection(current: Set<string>, docId: string, uploadIds: Set<string>): Set<string> {
  if (!uploadIds.has(docId)) return current;
  const next = new Set(current);
  if (next.has(docId)) next.delete(docId);
  else next.add(docId);
  return next;
}
