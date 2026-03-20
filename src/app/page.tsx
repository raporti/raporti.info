import { prisma } from "@/lib/db";
import ArticleCard from "@/components/article/ArticleCard";
import Link from "next/link";
import { CATEGORIES } from "@/lib/utils";
import { Zap, ArrowRight, TrendingUp } from "lucide-react";
import type { ArticleCard as ArticleCardType } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 60;

async function getPublishedArticles() {
  try {
    const articles = await prisma.article.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      take: 30,
      select: {
        id: true,
        titleSq: true,
        subtitleSq: true,
        summarySq: true,
        slug: true,
        category: true,
        urgency: true,
        featuredImage: true,
        imageMode: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        sourceName: true,
        sourceUrl: true,
      },
    });
    return articles as ArticleCardType[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const articles = await getPublishedArticles();
  const heroArticle = articles[0];
  const breakingArticles = articles.filter((a) => a.urgency === "breaking").slice(0, 5);
  const latestArticles = articles.slice(1, 13);
  const sidebarArticles = articles.slice(13, 20);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breaking news banner */}
      {breakingArticles.length > 0 && (
        <div className="mb-8 p-4 rounded-xl bg-breaking/5 border border-breaking/20">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-breaking" />
            <span className="text-xs font-bold text-breaking uppercase tracking-wider">
              Lajme të Fundit
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {breakingArticles.map((a) => (
              <Link
                key={a.id}
                href={`/news/${a.slug}`}
                className="text-sm text-text-primary hover:text-accent-hover transition-colors"
              >
                <span className="text-breaking mr-1.5">&#9679;</span>
                {a.titleSq}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Hero + sidebar layout */}
      {heroArticle && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2">
            <ArticleCard article={heroArticle} variant="hero" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Më të fundit
            </h3>
            {sidebarArticles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        </div>
      )}

      {/* Latest articles grid */}
      {latestArticles.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-text-primary">Lajmet e Fundit</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {latestArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Category sections */}
      {CATEGORIES.slice(0, 4).map((cat) => {
        const catArticles = articles.filter((a) => a.category === cat.slug).slice(0, 4);
        if (catArticles.length === 0) return null;
        return (
          <section key={cat.slug} className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <span
                  className="w-1 h-5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.name}
              </h2>
              <Link
                href={`/kategori/${cat.slug}`}
                className="text-xs text-accent hover:text-accent-hover flex items-center gap-1 transition-colors"
              >
                Shiko të gjitha
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {catArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        );
      })}

      {/* Empty state */}
      {articles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 bg-bg-card rounded-2xl flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-border">R</span>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Asnjë lajm ende
          </h2>
          <p className="text-text-muted text-sm text-center max-w-md">
            Artikujt do të shfaqen këtu sapo të publikohen. Konfiguroni burimet
            e Telegram dhe aktivizoni ingestionin për të filluar.
          </p>
        </div>
      )}
    </div>
  );
}
