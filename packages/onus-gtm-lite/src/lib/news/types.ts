export type NewsSortBy = "relevancy" | "publishedAt";
export type NewsRecencyDays = "7" | "30" | "90";
export type NewsSearchMode = "everything" | "top-headlines";
export type NewsCategory = "business" | "technology" | "general";

export type NewsSearchParams = {
  query?: string;
  recencyDays?: NewsRecencyDays;
  sortBy?: NewsSortBy;
  mode?: NewsSearchMode;
  category?: NewsCategory;
  domains?: string;
  pageSize?: number;
  language?: string;
};

export type NewsArticle = {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  source: string;
  publishedAt: string;
  publishedDate: string;
};

export type NewsSearchResult = {
  query: string;
  totalResults: number;
  articles: NewsArticle[];
};

export type NewsInput = {
  enabled: boolean;
  query?: string;
  recencyDays?: NewsRecencyDays;
  sortBy?: NewsSortBy;
  mode?: NewsSearchMode;
  category?: NewsCategory;
  domains?: string;
  pageSize?: number;
  articleIds?: string[];
};
