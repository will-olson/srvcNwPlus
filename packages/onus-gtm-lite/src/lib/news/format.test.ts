import { describe, expect, it } from "vitest";
import {
  buildNewsPromptBlock,
  formatArticlesForPrompt,
  formatNewsCitation,
} from "./format";
import type { NewsArticle } from "./types";

const sampleArticle: NewsArticle = {
  id: "abc123",
  title: "ServiceNow expands AI platform",
  description: "Enterprise workflow vendor announces new Build Agent capabilities.",
  content: "Enterprise workflow vendor announces new Build Agent capabilities.",
  url: "https://example.com/article",
  source: "Reuters",
  publishedAt: "2026-06-20T12:00:00Z",
  publishedDate: "2026-06-20",
};

describe("formatNewsCitation", () => {
  it("formats publisher date and headline", () => {
    expect(formatNewsCitation(sampleArticle)).toBe(
      "[Reuters · 2026-06-20 · ServiceNow expands AI platform]",
    );
  });
});

describe("formatArticlesForPrompt", () => {
  it("includes citation, summary, and URL", () => {
    const out = formatArticlesForPrompt([sampleArticle]);
    expect(out).toContain("[Reuters · 2026-06-20 · ServiceNow expands AI platform]");
    expect(out).toContain("URL: https://example.com/article");
    expect(out).toContain("Build Agent");
  });

  it("returns (none) for empty list", () => {
    expect(formatArticlesForPrompt([])).toBe("(none)");
  });
});

describe("buildNewsPromptBlock", () => {
  it("wraps articles with prompt header", () => {
    const block = buildNewsPromptBlock([sampleArticle]);
    expect(block).toContain("RECENT NEWS (cite as [Publisher · YYYY-MM-DD · headline]):");
    expect(block).toContain("Reuters");
  });

  it("returns empty string when no articles", () => {
    expect(buildNewsPromptBlock([])).toBe("");
  });
});
