import type {
  NewsArticle,
  NewsRecencyDays,
  NewsSearchParams,
  NewsSearchResult,
} from "./types";
import { fetchNewsApi } from "./client";
import { getNewsApiConfig } from "@/lib/env";

const cache = new Map<string, { expires: number; result: NewsSearchResult }>();

export function deriveNewsQuery(task: string, explicit?: string): string {
  if (explicit?.trim()) return explicit.trim();
  const cleaned = task
    .replace(/^(TASK|OBJECTIVE|GOAL):\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, 120);
}

function recencyToFromDate(days: NewsRecencyDays): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - Number.parseInt(days, 10));
  return d.toISOString().slice(0, 10);
}

function cacheKey(params: NewsSearchParams): string {
  return JSON.stringify(params);
}

export async function searchNews(params: NewsSearchParams): Promise<NewsSearchResult> {
  const config = getNewsApiConfig();
  if (!config) throw new Error("NEWS_API_KEY is not configured");

  const key = cacheKey(params);
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return cached.result;

  const mode = params.mode ?? "everything";
  const pageSize = params.pageSize ?? 8;
  const language = params.language ?? "en";
  const sortBy = params.sortBy ?? "relevancy";
  const recencyDays = params.recencyDays ?? "30";
  const query = params.query?.trim() ?? "";

  let totalResults = 0;
  let articles: NewsArticle[] = [];

  if (mode === "top-headlines") {
    const result = await fetchNewsApi(
      "top-headlines",
      {
        category: params.category ?? "business",
        language,
        pageSize,
        q: query || undefined,
      },
      config.apiKey,
      config.baseUrl,
    );
    totalResults = result.totalResults;
    articles = result.articles;
  } else {
    if (!query) {
      throw new Error("News search query is required for keyword search mode");
    }
    const result = await fetchNewsApi(
      "everything",
      {
        q: query,
        from: recencyToFromDate(recencyDays),
        sortBy,
        language,
        domains: params.domains?.trim() || undefined,
        pageSize,
      },
      config.apiKey,
      config.baseUrl,
    );
    totalResults = result.totalResults;
    articles = result.articles;
  }

  const searchResult: NewsSearchResult = {
    query: query || `(top-headlines:${params.category ?? "business"})`,
    totalResults,
    articles,
  };

  cache.set(key, {
    expires: Date.now() + config.cacheTtlSec * 1000,
    result: searchResult,
  });

  return searchResult;
}

export function filterArticlesByIds(
  articles: NewsArticle[],
  articleIds?: string[],
): NewsArticle[] {
  if (!articleIds?.length) return articles;
  const idSet = new Set(articleIds);
  return articles.filter((a) => idSet.has(a.id));
}

export function clearNewsCache(): void {
  cache.clear();
}
