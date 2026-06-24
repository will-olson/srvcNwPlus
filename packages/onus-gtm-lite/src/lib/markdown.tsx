import type { ReactNode } from "react";

function escape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inline(s: string): string {
  let out = escape(s);
  out = out.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-surface-2 rounded">$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  out = out.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a class="underline underline-offset-4 hover:text-signal" href="$2">$1</a>',
  );
  return out;
}

export function Markdown({ source }: { source: string }): ReactNode {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith("```")) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        buf.push(escape(lines[i]));
        i++;
      }
      i++;
      blocks.push(`<pre class="bg-surface-2 p-4 overflow-x-auto text-xs"><code>${buf.join("\n")}</code></pre>`);
      continue;
    }
    if (/^#{1,4}\s/.test(line)) {
      const m = line.match(/^(#{1,4})\s+(.*)$/)!;
      const lvl = m[1].length;
      const sizes = ["", "text-3xl mt-10 mb-4", "text-2xl mt-8 mb-3", "text-xl mt-6 mb-2", "text-lg mt-4 mb-2"];
      blocks.push(`<h${lvl} class="font-display ${sizes[lvl]}">${inline(m[2])}</h${lvl}>`);
      i++;
      continue;
    }
    if (/^---+$/.test(line.trim())) {
      blocks.push('<hr class="my-8 border-border" />');
      i++;
      continue;
    }
    if (line.trim().startsWith("|") && lines[i + 1] && /^\|?[ :|-]+\|?$/.test(lines[i + 1].trim())) {
      const header = line
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((c) => c.trim());
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(
          lines[i]
            .trim()
            .replace(/^\||\|$/g, "")
            .split("|")
            .map((c) => c.trim()),
        );
        i++;
      }
      const thead = `<thead><tr>${header.map((h) => `<th class="text-left text-[10px] num uppercase tracking-[0.18em] text-muted-foreground py-3 px-4 border-b border-border">${inline(h)}</th>`).join("")}</tr></thead>`;
      const tbody = `<tbody>${rows
        .map(
          (r) =>
            `<tr class="border-b border-border/60">${r
              .map((c) => `<td class="py-3 px-4 align-top text-sm">${inline(c)}</td>`)
              .join("")}</tr>`,
        )
        .join("")}</tbody>`;
      blocks.push(`<div class="my-6 overflow-x-auto"><table class="w-full">${thead}${tbody}</table></div>`);
      continue;
    }
    if (/^[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(`<li class="mb-1">${inline(lines[i].replace(/^[-*]\s/, ""))}</li>`);
        i++;
      }
      blocks.push(`<ul class="list-disc pl-5 my-4 space-y-1">${items.join("")}</ul>`);
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(`<li class="mb-1">${inline(lines[i].replace(/^\d+\.\s/, ""))}</li>`);
        i++;
      }
      blocks.push(`<ol class="list-decimal pl-5 my-4 space-y-1">${items.join("")}</ol>`);
      continue;
    }
    const buf = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|[-*]\s|\d+\.\s|```|\|)/.test(lines[i])) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push(`<p class="my-4 text-foreground/85 leading-relaxed">${inline(buf.join(" "))}</p>`);
  }
  return <div dangerouslySetInnerHTML={{ __html: blocks.join("\n") }} />;
}
