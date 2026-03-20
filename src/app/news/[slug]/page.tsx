import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatDateTime, getCategoryColor, getCategoryName, URGENCY_CONFIG } from "@/lib/utils";
import ShareButtons from "@/components/article/ShareButtons";
import ReadingProgress from "@/components/article/ReadingProgress";
import ArticleCard from "@/components/article/ArticleCard";
import Link from "next/link";
import { ArrowLeft, Clock, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import type { ArticleCard as ArticleCardType } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });

  if (!article) return { title: "Nuk u gjet" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://raporti.info";

  return {
    title: article.seoTitle || article.titleSq,
    description: article.seoDescription || article.summarySq || undefined,
    openGraph: {
      title: article.seoTitle || article.titleSq,
      description: article.seoDescription || article.summarySq || undefined,
      url: `${siteUrl}/news/${article.slug}`,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      images: article.featuredImage
        ? [{ url: `${siteUrl}${article.featuredImage}`, width: 1200, height: 630 }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.seoTitle || article.titleSq,
      description: article.seoDescription || article.summarySq || undefined,
    },
    alternates: {
      canonical: `${siteUrl}/news/${article.slug}`,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      telegramPost: { include: { source: true } },
    },
  });

  if (!article || article.status !== "published") {
    notFound();
  }

  // Related articles
  const related = (await prisma.article.findMany({
    where: {
      status: "published",
      category: article.category,
      id: { not: article.id },
    },
    orderBy: { publishedAt: "desc" },
    take: 4,
    select: {
      id: true, titleSq: true, subtitleSq: true, summarySq: true,
      slug: true, category: true, urgency: true, featuredImage: true,
      imageMode: true, status: true, publishedAt: true, createdAt: true,
      sourceName: true, sourceUrl: true,
    },
  })) as ArticleCardType[];

  const catColor = getCategoryColor(article.category);
  const catName = getCategoryName(article.category);
  const urgencyConf = URGENCY_CONFIG[article.urgency as keyof typeof URGENCY_CONFIG];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://raporti.info";
  const articleUrl = `${siteUrl}/news/${article.slug}`;

  // Structured data for news article
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.titleSq,
    description: article.summarySq || article.seoDescription,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "Raporti" },
    publisher: {
      "@type": "Organization",
      name: "Raporti",
      url: siteUrl,
    },
    mainEntityOfPage: articleUrl,
    image: article.featuredImage ? `${siteUrl}${article.featuredImage}` : undefined,
    articleSection: catName,
    inLanguage: "sq",
  };

  return (
    <>
      <ReadingProgress />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kthehu te lajmet
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {urgencyConf && (
              <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded ${urgencyConf.bgColor} ${urgencyConf.textColor}`}>
                {urgencyConf.label}
              </span>
            )}
            <Link
              href={`/kategori/${article.category}`}
              className="px-2.5 py-1 text-xs font-medium rounded transition-colors hover:opacity-80"
              style={{ backgroundColor: catColor + "20", color: catColor }}
            >
              {catName}
            </Link>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-text-primary leading-tight mb-4">
            {article.titleSq}
          </h1>

          {article.subtitleSq && (
            <p className="text-lg md:text-xl text-text-secondary mb-4">
              {article.subtitleSq}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <time dateTime={article.publishedAt?.toISOString()}>
                {article.publishedAt
                  ? formatDateTime(article.publishedAt)
                  : formatDateTime(article.createdAt)}
              </time>
            </div>
            <ShareButtons url={articleUrl} title={article.titleSq} />
          </div>
        </header>

        {/* Featured image */}
        {article.featuredImage && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img
              src={article.featuredImage}
              alt={article.titleSq}
              className="w-full aspect-[16/9] object-cover"
            />
          </div>
        )}

        {/* Why it matters */}
        {article.whyItMatters && (
          <div className="mb-8 p-4 rounded-xl bg-accent/5 border border-accent/20">
            <h3 className="text-sm font-bold text-accent mb-1.5 uppercase tracking-wider">
              Pse ka rëndësi
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {article.whyItMatters}
            </p>
          </div>
        )}

        {/* Article body */}
        <div className="article-body text-text-secondary text-base leading-relaxed mb-8">
          {article.bodySq.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {/* Editor note */}
        {article.editorNote && (
          <div className="mb-8 p-4 rounded-xl bg-bg-card border border-border">
            <h3 className="text-sm font-bold text-text-primary mb-1.5">
              Shënim redaksional
            </h3>
            <p className="text-sm text-text-muted">{article.editorNote}</p>
          </div>
        )}

        {/* Source attribution */}
        <div className="mb-8 p-4 rounded-xl bg-bg-card border border-border">
          <p className="text-sm text-text-muted">
            Burimi: Postim publik në Telegram nga{" "}
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover inline-flex items-center gap-1 transition-colors"
            >
              {article.sourceName}
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>

        {/* Share at bottom */}
        <div className="flex items-center justify-between py-4 border-t border-border mb-12">
          <span className="text-sm text-text-muted">Ndaje këtë artikull</span>
          <ShareButtons url={articleUrl} title={article.titleSq} />
        </div>
      </article>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <h2 className="text-lg font-bold text-text-primary mb-5">
            Artikuj të ngjashëm
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((r) => (
              <ArticleCard key={r.id} article={r} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
