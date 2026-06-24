import type { NewsArticle } from "./types";

export function formatNewsCitation(article: NewsArticle): string {
  return `[${article.source} · ${article.publishedDate} · ${article.title}]`;
}

export function formatArticlesForPrompt(articles: NewsArticle[], maxChars = 24_000): string {
  if (articles.length === 0) return "(none)";

  const blocks: string[] = [];
  let used = 0;

  for (const article of articles) {
    const block = `${formatNewsCitation(article)}
${article.description || article.content}
URL: ${article.url}
`;
    if (used + block.length > maxChars) break;
    blocks.push(block);
    used += block.length;
  }

  return blocks.join("\n");
}

export function buildNewsPromptBlock(articles: NewsArticle[]): string {
  if (articles.length === 0) return "";
  return `RECENT NEWS (cite as [Publisher · YYYY-MM-DD · headline]):
${formatArticlesForPrompt(articles)}`;
}
