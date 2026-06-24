import { describe, expect, it } from "vitest";
import { deriveNewsQuery, filterArticlesByIds } from "./search";
import type { NewsArticle } from "./types";

describe("deriveNewsQuery", () => {
  it("prefers explicit query", () => {
    expect(deriveNewsQuery("long task prompt here", "ServiceNow AI")).toBe("ServiceNow AI");
  });

  it("derives from task when explicit missing", () => {
    const task = "Generate a competitive battlecard for ServiceNow Build Agent in healthcare";
    expect(deriveNewsQuery(task)).toBe(task.slice(0, 120));
  });

  it("strips leading TASK label", () => {
    expect(deriveNewsQuery("TASK: Outline campaign pillars for Q3")).toBe(
      "Outline campaign pillars for Q3",
    );
  });
});

describe("filterArticlesByIds", () => {
  const articles: NewsArticle[] = [
    {
      id: "a1",
      title: "One",
      description: "",
      content: "",
      url: "https://a.com",
      source: "A",
      publishedAt: "",
      publishedDate: "2026-06-01",
    },
    {
      id: "a2",
      title: "Two",
      description: "",
      content: "",
      url: "https://b.com",
      source: "B",
      publishedAt: "",
      publishedDate: "2026-06-02",
    },
  ];

  it("returns all when no ids provided", () => {
    expect(filterArticlesByIds(articles)).toHaveLength(2);
  });

  it("filters to selected ids", () => {
    expect(filterArticlesByIds(articles, ["a2"])).toEqual([articles[1]]);
  });
});
