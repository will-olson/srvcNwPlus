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
  created_at: string;
};

export type KbChunk = {
  id: string;
  document_id: string;
  ord: number;
  page: number;
  content: string;
  token_estimate: number;
};

export type GenerationRecord = {
  id: string;
  module: string;
  prompt: { task: string; extraContext?: string; model?: string; followUp?: string };
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
