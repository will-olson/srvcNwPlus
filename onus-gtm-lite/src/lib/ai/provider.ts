export interface AiProvider {
  chat(params: { system: string; user: string; model?: string }): Promise<string>;
}

export function getDefaultModel(): string {
  if (process.env.AI_PROVIDER === "lovable") {
    return process.env.LOVABLE_MODEL ?? "google/gemini-2.5-flash";
  }
  return process.env.OPENAI_MODEL ?? "gpt-4o-mini";
}

export async function createAiProvider(): Promise<AiProvider> {
  const provider = process.env.AI_PROVIDER ?? "openai";
  if (provider === "lovable") {
    const { lovableProvider } = await import("./lovable");
    return lovableProvider();
  }
  const { openaiProvider } = await import("./openai");
  return openaiProvider();
}
