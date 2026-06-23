import type { AiProvider } from "./provider";

export function lovableProvider(): AiProvider {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

  return {
    async chat({ system, user, model }) {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model ?? process.env.LOVABLE_MODEL ?? "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`AI gateway error [${resp.status}]: ${text.slice(0, 300)}`);
      }
      const json = (await resp.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      return json.choices?.[0]?.message?.content ?? "";
    },
  };
}
