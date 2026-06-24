import { Markdown } from "@/lib/markdown";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  meta?: string;
  createdAt: string;
};

export function ChatThread({ messages, pending }: { messages: ChatMessage[]; pending?: boolean }) {
  if (messages.length === 0 && !pending) {
    return (
      <div className="border border-dashed border-border p-10 text-sm text-muted-foreground">
        Configure the prompt and press Generate. Output appears here as a chat thread.
      </div>
    );
  }

  return (
    <div className="border border-border bg-background/60 divide-y divide-border">
      {messages.map((m) => (
        <div key={m.id} className="p-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span
              className="num text-[10px] uppercase tracking-[0.22em]"
              style={{ color: m.role === "user" ? "var(--studio-accent)" : "var(--foreground)" }}
            >
              {m.role === "user" ? "Operator input" : "Operator log"} ·{" "}
              {new Date(m.createdAt).toISOString().slice(11, 19)}Z
            </span>
            {m.meta && (
              <span className="num text-[10px] text-muted-foreground truncate">{m.meta}</span>
            )}
          </div>
          {m.role === "assistant" ? (
            <div className="prose-style text-sm">
              <Markdown source={m.content} />
            </div>
          ) : (
            <pre className="font-mono text-[11px] whitespace-pre-wrap text-muted-foreground">{m.content}</pre>
          )}
        </div>
      ))}
      {pending && (
        <div className="p-4 text-sm text-muted-foreground animate-pulse">
          <span style={{ color: "var(--studio-accent)" }}>●</span> Generating grounded draft…
        </div>
      )}
    </div>
  );
}
