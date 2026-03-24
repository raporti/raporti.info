import Link from "next/link";
import { timeAgo, getCategoryColor, getCategoryName, URGENCY_CONFIG } from "@/lib/utils";
import type { ArticleCard as ArticleCardType } from "@/types";

interface Props {
  article: ArticleCardType;
  variant?: "default" | "hero" | "compact" | "featured";
}

export default function ArticleCard({ article, variant = "default" }: Props) {
  const urgencyConf = URGENCY_CONFIG[article.urgency as keyof typeof URGENCY_CONFIG];
  const catColor = getCategoryColor(article.category);
  const catName = getCategoryName(article.category);
  const timeStr = article.publishedAt ? timeAgo(article.publishedAt) : timeAgo(article.createdAt);

  // Hero: large newspaper-style lead article
  if (variant === "hero") {
    return (
      <Link
        href={`/news/${article.slug}`}
        className="group block relative overflow-hidden rounded-lg"
      >
        <div className="aspect-[16/9] md:aspect-[2/1] bg-bg-secondary relative overflow-hidden rounded-lg">
          {article.featuredImage ? (
            <img
              src={article.featuredImage}
              alt={article.titleSq}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-7xl font-extrabold text-gray-300">R</span>
            </div>
          )}
          {/* Dark overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-3">
              {article.urgency === "breaking" && urgencyConf && (
                <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded bg-accent text-white">
                  {urgencyConf.label}
                </span>
              )}
              <span
                className="px-2.5 py-1 text-[11px] font-semibold rounded text-white/90"
                style={{ backgroundColor: catColor + "cc" }}
              >
                {catName}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-3 leading-tight group-hover:underline decoration-2 underline-offset-4">
              {article.titleSq}
            </h2>
            {article.subtitleSq && (
              <p className="text-white/75 text-sm md:text-base mb-3 line-clamp-2 max-w-2xl">
                {article.subtitleSq}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-white/60">
              <span className="font-medium text-white/80">{article.sourceName}</span>
              <span className="w-1 h-1 rounded-full bg-white/40" />
              <span>{timeStr}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Featured: medium-sized card with image on top, used for secondary stories
  if (variant === "featured") {
    return (
      <Link
        href={`/news/${article.slug}`}
        className="group block"
      >
        <div className="aspect-[16/9] bg-bg-secondary relative overflow-hidden rounded-lg mb-3">
          {article.featuredImage ? (
            <img
              src={article.featuredImage}
              alt={article.titleSq}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-3xl font-bold text-gray-300">R</span>
            </div>
          )}
          {article.urgency === "breaking" && urgencyConf && (
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-accent text-white">
                {urgencyConf.label}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: catColor }}
          >
            {catName}
          </span>
        </div>
        <h3 className="text-lg font-bold text-text-primary group-hover:text-accent transition-colors leading-snug mb-2">
          {article.titleSq}
        </h3>
        {article.summarySq && (
          <p className="text-sm text-text-secondary line-clamp-2 mb-2">
            {article.summarySq}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>{article.sourceName}</span>
          <span className="w-1 h-1 rounded-full bg-text-muted" />
          <span>{timeStr}</span>
        </div>
      </Link>
    );
  }

  // Compact: small horizontal card for sidebars and lists
  if (variant === "compact") {
    return (
      <Link
        href={`/news/${article.slug}`}
        className="group flex gap-4 py-3.5 border-b border-border last:border-b-0"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: catColor }}
            >
              {catName}
            </span>
            {article.urgency === "breaking" && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            )}
          </div>
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors line-clamp-2 leading-snug">
            {article.titleSq}
          </h3>
          <span className="text-xs text-text-muted mt-1.5 block">
            {timeStr}
          </span>
        </div>
        {article.featuredImage && (
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-bg-secondary">
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
      className="group block"
    >
      {/* Thumbnail */}
      <div className="aspect-[16/9] bg-bg-secondary relative overflow-hidden rounded-lg mb-3">
        {article.featuredImage ? (
          <img
            src={article.featuredImage}
            alt={article.titleSq}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-3xl font-bold text-gray-300">R</span>
          </div>
        )}
        {article.urgency === "breaking" && urgencyConf && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-accent text-white">
              {urgencyConf.label}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: catColor }}
          >
            {catName}
          </span>
        </div>
        <h3 className="text-base font-bold text-text-primary group-hover:text-accent transition-colors line-clamp-2 leading-snug mb-1.5">
          {article.titleSq}
        </h3>
        {article.summarySq && (
          <p className="text-sm text-text-secondary line-clamp-2 mb-2">
            {article.summarySq}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>{article.sourceName}</span>
          <span className="w-1 h-1 rounded-full bg-text-muted" />
          <span>{timeStr}</span>
        </div>
      </div>
    </Link>
  );
}
