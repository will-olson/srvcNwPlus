import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getDataDir(): string {
  return process.env.DATA_DIR ?? path.resolve(__dirname, "../../data");
}

export function getDocumentsDir(): string {
  return path.join(getDataDir(), "documents");
}

export function getSeedsPath(): string {
  return path.join(getDataDir(), "seeds", "brand-context.json");
}
