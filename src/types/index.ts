import type { Article, TelegramPost, Source } from "@prisma/client";

export type ArticleWithPost = Article & {
  telegramPost: TelegramPost & {
    source: Source;
  };
};

export type ArticleCard = Pick<
  Article,
  | "id"
  | "titleSq"
  | "subtitleSq"
  | "summarySq"
  | "slug"
  | "category"
  | "urgency"
  | "featuredImage"
  | "imageMode"
  | "status"
  | "publishedAt"
  | "createdAt"
  | "sourceName"
  | "sourceUrl"
>;

export interface IngestResult {
  ingested: number;
  skipped: number;
  errors: string[];
}

export interface ProcessResult {
  processed: number;
  errors: string[];
}

export interface CronResult {
  ingest: IngestResult;
  process: ProcessResult;
}
