import OpenAI from "openai";
import { getOpenAiConfig } from "@/lib/env";
import type { AiProvider } from "./provider";

const MAX_TOKENS = 4096;
const TEMPERATURE = 0.4;

function formatOpenAiError(err: unknown): Error {
  if (err instanceof OpenAI.APIError) {
    if (err.status === 401) return new Error("OPENAI_API_KEY is invalid or unauthorized");
    if (err.status === 429) return new Error("OpenAI rate limit exceeded — retry shortly");
    return new Error(`OpenAI API error [${err.status}]: ${err.message}`);
  }
  if (err instanceof Error) return err;
  return new Error("OpenAI request failed");
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const retryable =
      err instanceof OpenAI.APIError && (err.status === 429 || (err.status ?? 0) >= 500);
    if (!retryable) throw err;
    await new Promise((r) => setTimeout(r, 800));
    return fn();
  }
}

export function openaiProvider(): AiProvider {
  const config = getOpenAiConfig();
  if (!config) throw new Error("OPENAI_API_KEY is not configured");

  const client = new OpenAI({ apiKey: config.apiKey });

  return {
    async chat({ system, user, model }) {
      try {
        const resp = await withRetry(() =>
          client.chat.completions.create({
            model: model ?? config.model,
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
            ],
            max_tokens: MAX_TOKENS,
            temperature: TEMPERATURE,
          }),
        );
        return resp.choices[0]?.message?.content ?? "";
      } catch (err) {
        throw formatOpenAiError(err);
      }
    },
  };
}
