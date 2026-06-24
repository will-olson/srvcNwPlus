import { getAiProviderName, getDefaultModel as getDefaultModelFromEnv } from "@/lib/env";

export interface AiProvider {
  chat(params: { system: string; user: string; model?: string }): Promise<string>;
}

export function getDefaultModel(): string {
  return getDefaultModelFromEnv();
}

export async function createAiProvider(): Promise<AiProvider> {
  const provider = getAiProviderName();
  if (provider === "lovable") {
    const { lovableProvider } = await import("./lovable");
    return lovableProvider();
  }
  const { openaiProvider } = await import("./openai");
  return openaiProvider();
}
