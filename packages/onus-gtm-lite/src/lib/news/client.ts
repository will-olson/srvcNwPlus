import { createHash } from "node:crypto";
import type { NewsArticle } from "./types";

type NewsApiArticle = {
  source?: { name?: string | null };
  title?: string | null;
  description?: string | null;
  content?: string | null;
  url?: string | null;
  publishedAt?: string | null;
};

type NewsApiResponse = {
  status: string;
  totalResults?: number;
  message?: string;
  code?: string;
  articles?: NewsApiArticle[];
};

export function articleIdFromUrl(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 16);
}

function formatPublishedDate(iso: string | null | undefined): string {
  if (!iso) return "unknown-date";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export function mapNewsApiArticle(raw: NewsApiArticle): NewsArticle | null {
  const url = raw.url?.trim();
  const title = raw.title?.trim();
  if (!url || !title) return null;

  const publishedAt = raw.publishedAt ?? "";
  return {
    id: articleIdFromUrl(url),
    title,
    description: raw.description?.trim() ?? "",
    content: raw.content?.trim() ?? raw.description?.trim() ?? "",
    url,
    source: raw.source?.name?.trim() || "Unknown",
    publishedAt,
    publishedDate: formatPublishedDate(publishedAt),
  };
}

export function parseNewsApiResponse(json: NewsApiResponse): NewsArticle[] {
  if (json.status !== "ok") {
    throw new Error(json.message ?? `NewsAPI error (${json.code ?? "unknown"})`);
  }
  return (json.articles ?? [])
    .map(mapNewsApiArticle)
    .filter((a): a is NewsArticle => a !== null);
}

export async function fetchNewsApi(
  endpoint: "everything" | "top-headlines",
  params: Record<string, string | number | undefined>,
  apiKey: string,
  baseUrl: string,
): Promise<{ totalResults: number; articles: NewsArticle[] }> {
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  url.searchParams.set("apiKey", apiKey);

  const resp = await fetch(url.toString());
  const json = (await resp.json()) as NewsApiResponse;

  if (!resp.ok) {
    throw new Error(json.message ?? `NewsAPI HTTP ${resp.status}`);
  }

  const articles = parseNewsApiResponse(json);
  return { totalResults: json.totalResults ?? articles.length, articles };
}
