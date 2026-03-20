import Link from "next/link";
import { timeAgo, getCategoryColor, getCategoryName, URGENCY_CONFIG } from "@/lib/utils";
import type { ArticleCard as ArticleCardType } from "@/types";

interface Props {
  article: ArticleCardType;
  variant?: "default" | "hero" | "compact";
}

export default function ArticleCard({ article, variant = "default" }: Props) {
  const urgencyConf = URGENCY_CONFIG[article.urgency as keyof typeof URGENCY_CONFIG];
  const catColor = getCategoryColor(article.category);
  const catName = getCategoryName(article.category);

  if (variant === "hero") {
    return (
      <Link
        href={`/news/${article.slug}`}
        className="group block relative overflow-hidden rounded-2xl bg-bg-card border border-border hover:border-border-light transition-all duration-300"
      >
        {/* Thumbnail area */}
        <div className="aspect-[16/9] md:aspect-[21/9] bg-bg-hover relative overflow-hidden">
          {article.featuredImage ? (
            <img
              src={article.featuredImage}
              alt={article.titleSq}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-bg-card via-bg-hover to-bg-secondary">
              <span className="text-6xl font-bold text-border">R</span>
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/95 via-bg-primary/40 to-transparent" />

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-3">
              {article.urgency === "breaking" && urgencyConf && (
                <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded ${urgencyConf.bgColor} ${urgencyConf.textColor}`}>
                  {urgencyConf.label}
                </span>
              )}
              <span
                className="px-2.5 py-1 text-xs font-medium rounded"
                style={{ backgroundColor: catColor + "20", color: catColor }}
              >
                {catName}
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-text-primary mb-2 group-hover:text-accent-hover transition-colors leading-tight">
              {article.titleSq}
            </h2>
            {article.subtitleSq && (
              <p className="text-text-secondary text-sm md:text-base mb-3 line-clamp-2">
                {article.subtitleSq}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span>{article.sourceName}</span>
              <span className="w-1 h-1 rounded-full bg-text-muted" />
              <span>{article.publishedAt ? timeAgo(article.publishedAt) : timeAgo(article.createdAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/news/${article.slug}`}
        className="group flex gap-4 p-3 rounded-xl hover:bg-bg-hover transition-all duration-200"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="px-2 py-0.5 text-[10px] font-medium rounded"
              style={{ backgroundColor: catColor + "20", color: catColor }}
            >
              {catName}
            </span>
            {article.urgency === "breaking" && (
              <span className="w-1.5 h-1.5 rounded-full bg-breaking animate-pulse" />
            )}
          </div>
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-hover transition-colors line-clamp-2 leading-snug">
            {article.titleSq}
          </h3>
          <span className="text-xs text-text-muted mt-1 block">
            {article.publishedAt ? timeAgo(article.publishedAt) : timeAgo(article.createdAt)}
          </span>
        </div>
        {article.featuredImage && (
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-bg-hover">
            <img
              src={article.featuredImage}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </Link>
    );
  }

  // Default card
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group block rounded-xl bg-bg-card border border-border hover:border-border-light hover:bg-bg-hover transition-all duration-300 overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="aspect-[16/9] bg-bg-hover relative overflow-hidden">
        {article.featuredImage ? (
          <img
            src={article.featuredImage}
            alt={article.titleSq}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-bg-card to-bg-hover">
            <span className="text-3xl font-bold text-border">R</span>
          </div>
        )}
        {article.urgency === "breaking" && urgencyConf && (
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${urgencyConf.bgColor} ${urgencyConf.textColor} backdrop-blur-sm`}>
              {urgencyConf.label}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="px-2 py-0.5 text-[10px] font-medium rounded"
            style={{ backgroundColor: catColor + "20", color: catColor }}
          >
            {catName}
          </span>
        </div>
        <h3 className="text-base font-semibold text-text-primary group-hover:text-accent-hover transition-colors line-clamp-2 leading-snug mb-2">
          {article.titleSq}
        </h3>
        {article.summarySq && (
          <p className="text-sm text-text-secondary line-clamp-2 mb-3">
            {article.summarySq}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>{article.sourceName}</span>
          <span className="w-1 h-1 rounded-full bg-text-muted" />
          <span>{article.publishedAt ? timeAgo(article.publishedAt) : timeAgo(article.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
