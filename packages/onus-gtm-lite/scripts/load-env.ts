import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadDotenv } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(packageRoot, "../..");

for (const dir of [repoRoot, packageRoot]) {
  for (const name of [".env", ".env.local"]) {
    const filePath = path.join(dir, name);
    if (fs.existsSync(filePath)) {
      loadDotenv({ path: filePath, override: false });
    }
  }
}
