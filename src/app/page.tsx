import { prisma } from "@/lib/db";
import ArticleCard from "@/components/article/ArticleCard";
import Link from "next/link";
import { CATEGORIES } from "@/lib/utils";
import { Zap, ArrowRight } from "lucide-react";
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
  const secondaryArticles = articles.slice(1, 3);
  const latestArticles = articles.slice(3, 12);
  const sidebarArticles = articles.slice(12, 19);

  return (
    <div>
      {/* Breaking news ticker */}
      {breakingArticles.length > 0 && (
        <div className="bg-accent text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 flex items-center">
            <div className="flex items-center gap-2 py-2.5 pr-4 border-r border-white/20 flex-shrink-0">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Lajm i Fundit
              </span>
            </div>
            <div className="overflow-hidden flex-1">
              <div className="flex gap-12 ticker-scroll whitespace-nowrap py-2.5 pl-4">
                {[...breakingArticles, ...breakingArticles].map((a, i) => (
                  <Link
                    key={`${a.id}-${i}`}
                    href={`/news/${a.slug}`}
                    className="text-sm text-white/90 hover:text-white transition-colors inline-flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
                    {a.titleSq}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero section: main story + secondary stories */}
        {heroArticle && (
          <section className="mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main hero */}
              <div className="lg:col-span-2">
                <ArticleCard article={heroArticle} variant="hero" />
              </div>

              {/* Secondary stories + sidebar */}
              <div className="space-y-5">
                {secondaryArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} variant="featured" />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Latest news section */}
        {latestArticles.length > 0 && (
          <section className="mb-12">
            <div className="section-divider">
              <h2 className="text-xl font-extrabold text-text-primary uppercase tracking-wide">
                Lajmet e Fundit
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main grid */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {latestArticles.slice(0, 6).map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <aside className="lg:border-l lg:border-border lg:pl-6">
                <div className="section-divider">
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                    Më të lexuarat
                  </h3>
                </div>
                <div>
                  {sidebarArticles.map((article, i) => (
                    <div key={article.id} className="flex gap-3 items-start">
                      <span className="text-2xl font-extrabold text-accent/20 leading-none pt-3 flex-shrink-0 w-8 text-right">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <ArticleCard article={article} variant="compact" />
                      </div>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </section>
        )}

        {/* Category sections */}
        {CATEGORIES.slice(0, 4).map((cat) => {
          const catArticles = articles.filter((a) => a.category === cat.slug).slice(0, 4);
          if (catArticles.length === 0) return null;
          return (
            <section key={cat.slug} className="mb-10">
              <div className="section-divider flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-text-primary flex items-center gap-2.5 uppercase tracking-wide">
                  <span
                    className="w-1 h-5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </h2>
                <Link
                  href={`/kategori/${cat.slug}`}
                  className="text-xs font-semibold text-accent hover:text-accent-hover flex items-center gap-1 transition-colors uppercase tracking-wider"
                >
                  Shiko të gjitha
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {catArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          );
        })}

        {/* Empty state */}
        {articles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="mb-6">
              <span className="text-5xl font-extrabold text-text-primary tracking-tight">
                RAPORTI<span className="text-accent">.</span>
              </span>
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
    </div>
  );
}
