import { getLovableConfig } from "@/lib/env";
import type { AiProvider } from "./provider";

export function lovableProvider(): AiProvider {
  const config = getLovableConfig();
  if (!config) throw new Error("LOVABLE_API_KEY is not configured");

  return {
    async chat({ system, user, model }) {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model ?? config.model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });
      if (!resp.ok) {
        const text = await resp.text();
        if (resp.status === 401) throw new Error("LOVABLE_API_KEY is invalid or unauthorized");
        if (resp.status === 429) throw new Error("Lovable gateway rate limit exceeded");
        throw new Error(`AI gateway error [${resp.status}]: ${text.slice(0, 300)}`);
      }
      const json = (await resp.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      return json.choices?.[0]?.message?.content ?? "";
    },
  };
}
