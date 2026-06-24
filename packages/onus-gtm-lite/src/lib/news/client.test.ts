import { describe, expect, it } from "vitest";
import {
  articleIdFromUrl,
  mapNewsApiArticle,
  parseNewsApiResponse,
} from "./client";

describe("articleIdFromUrl", () => {
  it("returns stable 16-char hash", () => {
    const a = articleIdFromUrl("https://example.com/a");
    const b = articleIdFromUrl("https://example.com/a");
    expect(a).toBe(b);
    expect(a).toHaveLength(16);
  });
});

describe("mapNewsApiArticle", () => {
  it("maps valid article fields", () => {
    const article = mapNewsApiArticle({
      source: { name: "TechCrunch" },
      title: "AI platforms race ahead",
      description: "Summary line",
      url: "https://techcrunch.com/post",
      publishedAt: "2026-06-01T08:00:00Z",
    });
    expect(article).toMatchObject({
      title: "AI platforms race ahead",
      source: "TechCrunch",
      publishedDate: "2026-06-01",
    });
    expect(article?.id).toBeTruthy();
  });

  it("returns null when title or url missing", () => {
    expect(mapNewsApiArticle({ title: "Only title" })).toBeNull();
  });
});

describe("parseNewsApiResponse", () => {
  it("parses ok response", () => {
    const articles = parseNewsApiResponse({
      status: "ok",
      articles: [
        {
          source: { name: "BBC" },
          title: "Headline",
          url: "https://bbc.com/1",
          publishedAt: "2026-06-15T00:00:00Z",
        },
      ],
    });
    expect(articles).toHaveLength(1);
    expect(articles[0]?.source).toBe("BBC");
  });

  it("throws on error status", () => {
    expect(() =>
      parseNewsApiResponse({ status: "error", message: "Invalid API key" }),
    ).toThrow("Invalid API key");
  });
});
