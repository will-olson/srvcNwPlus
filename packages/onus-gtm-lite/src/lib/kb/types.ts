export type KbDocument = {
  id: string;
  title: string;
  filename: string;
  storage_path: string;
  mime: string;
  byte_size: number | null;
  page_count: number | null;
  status: string;
  is_seed: boolean;
  summary: string | null;
  cluster?: string | null;
  doc_series?: string | null;
  created_at: string;
};

export type KbChunk = {
  id: string;
  document_id: string;
  ord: number;
  page: number;
  content: string;
  token_estimate: number;
  heading_path?: string;
  section_ord?: number;
};

export type GenerationRecord = {
  id: string;
  module: string;
  prompt: {
    task: string;
    extraContext?: string;
    model?: string;
    followUp?: string;
    news?: import("@/lib/news/types").NewsInput;
  };
  output_md: string;
  document_ids: string[];
  created_at: string;
};

export type BrandContext = {
  voice_rules: Array<{ kind: "do" | "dont"; rule: string; example?: string }>;
  brand_wiki_sections: Array<{ title: string; body_md: string }>;
  content_pillars: Array<{ slug: string; title: string; theme?: string }>;
  personas: Array<{ slug: string; name: string }>;
};

export type MarkdownPage = {
  page: number;
  text: string;
  heading_path?: string;
  section_ord?: number;
};

export type SectionIndexEntry = {
  heading: string;
  page: number;
  char_start: number;
  char_end: number;
  keywords: string[];
};

export type DocumentDistillate = {
  document_id: string;
  purpose?: string;
  category?: string;
  doc_series?: string | null;
  section_index: SectionIndexEntry[];
  summary?: string;
  key_claims?: string[];
};

export type KbManifestEntry = {
  cluster: "echelon" | "profound" | "monte-carlo";
  series?: "A" | "B" | "C" | null;
  title: string;
};

export type TranslationFixture = {
  id: string;
  label: string;
  useCaseId: string;
  discipline: string;
  documentFilenames: string[];
  fieldValues: Record<string, string>;
  expectCitationsFrom: string[];
  expectTerms: string[];
};
