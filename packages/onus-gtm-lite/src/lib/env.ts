import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getRepoRoot(): string {
  return path.resolve(__dirname, "../../../..");
}

export function getPackageRoot(): string {
  return path.resolve(__dirname, "../..");
}

export type AiProviderName = "openai" | "lovable";

export type OpenAiConfig = {
  apiKey: string;
  model: string;
};

export type LovableConfig = {
  apiKey: string;
  model: string;
};

export type NewsApiConfig = {
  apiKey: string;
  baseUrl: string;
  cacheTtlSec: number;
};

export type AiProviderConfig = {
  provider: AiProviderName;
  openai: OpenAiConfig | null;
  lovable: LovableConfig | null;
  defaultModel: string;
};

export type EnvStatus = {
  openai: "ok" | "missing";
  news: "ok" | "missing";
  lovable: "ok" | "missing";
  provider: AiProviderName;
  model: string;
};

function readEnv(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value || undefined;
}

export function getAiProviderName(): AiProviderName {
  const provider = readEnv("AI_PROVIDER") ?? "openai";
  return provider === "lovable" ? "lovable" : "openai";
}

export function getOpenAiConfig(): OpenAiConfig | null {
  const apiKey = readEnv("OPENAI_API_KEY");
  if (!apiKey) return null;
  return {
    apiKey,
    model: readEnv("OPENAI_MODEL") ?? "gpt-4o-mini",
  };
}

export function getLovableConfig(): LovableConfig | null {
  const apiKey = readEnv("LOVABLE_API_KEY");
  if (!apiKey) return null;
  return {
    apiKey,
    model: readEnv("LOVABLE_MODEL") ?? "google/gemini-2.5-flash",
  };
}

export function getNewsApiConfig(): NewsApiConfig | null {
  const apiKey = readEnv("NEWS_API_KEY");
  if (!apiKey) return null;
  const ttlRaw = readEnv("NEWS_CACHE_TTL_SEC");
  return {
    apiKey,
    baseUrl: readEnv("NEWS_API_BASE_URL") ?? "https://newsapi.org/v2",
    cacheTtlSec: ttlRaw ? Number.parseInt(ttlRaw, 10) : 900,
  };
}

export function getAiProviderConfig(): AiProviderConfig {
  const provider = getAiProviderName();
  const openai = getOpenAiConfig();
  const lovable = getLovableConfig();
  const defaultModel =
    provider === "lovable"
      ? (lovable?.model ?? "google/gemini-2.5-flash")
      : (openai?.model ?? "gpt-4o-mini");

  return { provider, openai, lovable, defaultModel };
}

export function getDefaultModel(): string {
  return getAiProviderConfig().defaultModel;
}

export function assertServerEnv(): void {
  const { provider, openai, lovable } = getAiProviderConfig();
  if (provider === "lovable") {
    if (!lovable?.apiKey) throw new Error("LOVABLE_API_KEY is not configured");
    return;
  }
  if (!openai?.apiKey) throw new Error("OPENAI_API_KEY is not configured");
}

export function assertNewsEnv(): void {
  if (!getNewsApiConfig()?.apiKey) {
    throw new Error("NEWS_API_KEY is not configured");
  }
}

export function getEnvStatus(): EnvStatus {
  const { provider, defaultModel } = getAiProviderConfig();
  return {
    openai: getOpenAiConfig()?.apiKey ? "ok" : "missing",
    news: getNewsApiConfig()?.apiKey ? "ok" : "missing",
    lovable: getLovableConfig()?.apiKey ? "ok" : "missing",
    provider,
    model: defaultModel,
  };
}
