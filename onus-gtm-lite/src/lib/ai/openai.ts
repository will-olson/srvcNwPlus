import OpenAI from "openai";
import type { AiProvider } from "./provider";

export function openaiProvider(): AiProvider {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const client = new OpenAI({ apiKey });

  return {
    async chat({ system, user, model }) {
      const resp = await client.chat.completions.create({
        model: model ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      });
      return resp.choices[0]?.message?.content ?? "";
    },
  };
}
