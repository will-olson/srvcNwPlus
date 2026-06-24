import "./load-env.js";
import fs from "node:fs/promises";
import path from "node:path";
import { USE_CASES } from "../src/config/use-cases.js";
import { runGroundedGeneration } from "../src/lib/generate.js";
import { findDocumentsByFilenames } from "../src/lib/kb/store.js";
import type { TranslationFixture } from "../src/lib/kb/types.js";
import { getDataDir, getTranslationFixturesPath } from "../src/lib/paths.js";
import { seedKnowledgeBase } from "./seed-kb.js";

const CITATION_PATTERN = /\[[^\]]+ · p\.\d+\]/;

function assertFixtureOutput(
  fixture: TranslationFixture,
  output: string,
  docTitles: string[],
): string[] {
  const errors: string[] = [];

  if (!output.trim()) {
    errors.push("empty output");
  }

  if (!CITATION_PATTERN.test(output)) {
    errors.push("missing citation pattern [Title · p.N]");
  }

  for (const fragment of fixture.expectCitationsFrom) {
    const cited = docTitles.some(
      (title) => title.includes(fragment) && output.includes(title.split(" ·")[0].slice(0, 20)),
    );
    const citationHit =
      CITATION_PATTERN.test(output) &&
      docTitles.some((title) => title.includes(fragment) && output.includes("["));
    if (!citationHit && !cited) {
      errors.push(`expected citation context from "${fragment}"`);
    }
  }

  for (const term of fixture.expectTerms) {
    if (!output.toLowerCase().includes(term.toLowerCase())) {
      errors.push(`missing expected term "${term}"`);
    }
  }

  return errors;
}

async function loadFixtures(): Promise<TranslationFixture[]> {
  const raw = await fs.readFile(getTranslationFixturesPath(), "utf8");
  return JSON.parse(raw) as TranslationFixture[];
}

export async function runTranslationFixtures(): Promise<void> {
  const provider = process.env.AI_PROVIDER ?? "openai";
  if (provider === "lovable") {
    if (!process.env.LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is required when AI_PROVIDER=lovable");
    }
  } else if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required for translation fixture tests");
  }

  await seedKnowledgeBase();

  const fixtures = await loadFixtures();
  const runDir = path.join(getDataDir(), "test-runs", new Date().toISOString().replace(/[:.]/g, "-"));
  await fs.mkdir(runDir, { recursive: true });

  let passed = 0;
  let failed = 0;

  for (const fixture of fixtures) {
    const docs = await findDocumentsByFilenames(fixture.documentFilenames);
    if (docs.length !== fixture.documentFilenames.length) {
      const missing = fixture.documentFilenames.filter(
        (f) => !docs.find((d) => d.filename === f),
      );
      console.error(`FAIL  ${fixture.id}: missing seeded docs: ${missing.join(", ")}`);
      failed++;
      continue;
    }

    const useCase = USE_CASES.find((u) => u.id === fixture.useCaseId);
    if (!useCase) {
      console.error(`FAIL  ${fixture.id}: unknown use case ${fixture.useCaseId}`);
      failed++;
      continue;
    }

    const task = useCase.buildTask(fixture.fieldValues);
    const result = await runGroundedGeneration({
      module: useCase.module,
      documentIds: docs.map((d) => d.id),
      task,
      includeVoice: true,
      includeWiki: true,
    });

    const docTitles = docs.map((d) => d.title);
    const errors = assertFixtureOutput(fixture, result.output, docTitles);

    const outPath = path.join(runDir, `${fixture.id}.md`);
    await fs.writeFile(
      outPath,
      `# ${fixture.label}\n\n${result.output}\n\n---\n\nModel: ${result.model}\nKB chars: ${result.kbCharsUsed}\nBlocks: ${result.blocks}\n`,
      "utf8",
    );

    if (errors.length > 0) {
      console.error(`FAIL  ${fixture.id}: ${errors.join("; ")}`);
      failed++;
    } else {
      console.log(`PASS  ${fixture.id} → ${outPath}`);
      passed++;
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed (output in ${runDir})`);
  if (failed > 0) process.exit(1);
}

if (process.argv[1]?.includes("run-translation-fixtures")) {
  runTranslationFixtures().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
