import { prisma } from "@/lib/db";
import ArticleCard from "@/components/article/ArticleCard";
import { CATEGORIES, getCategoryName, getCategoryColor } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { ArticleCard as ArticleCardType } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const catName = getCategoryName(slug);
  return {
    title: `${catName} - Lajme`,
    description: `Lajmet e fundit në kategorinë ${catName}. Lexoni më të rejat në raporti.info.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) notFound();

  const articles = (await prisma.article.findMany({
    where: { status: "published", category: slug },
    orderBy: { publishedAt: "desc" },
    take: 50,
    select: {
      id: true, titleSq: true, subtitleSq: true, summarySq: true,
      slug: true, category: true, urgency: true, featuredImage: true,
      imageMode: true, status: true, publishedAt: true, createdAt: true,
      sourceName: true, sourceUrl: true,
    },
  })) as ArticleCardType[];

  const catColor = getCategoryColor(slug);
  const heroArticle = articles[0];
  const restArticles = articles.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <Link href="/" className="text-text-muted hover:text-accent transition-colors">
          Kryefaqja
        </Link>
        <span className="text-text-muted">/</span>
        <span className="font-medium" style={{ color: catColor }}>
          {category.name}
        </span>
      </div>

      {/* Category header */}
      <div className="section-divider mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary flex items-center gap-3">
            <span
              className="w-1.5 h-8 rounded-full"
              style={{ backgroundColor: catColor }}
            />
            {category.name}
          </h1>
          <span className="text-sm text-text-muted">
            {articles.length} artikuj
          </span>
        </div>
      </div>

      {articles.length > 0 ? (
        <div>
          {/* Hero article for category */}
          {heroArticle && (
            <div className="mb-8">
              <ArticleCard article={heroArticle} variant="hero" />
            </div>
          )}

          {/* Rest of articles */}
          {restArticles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24">
          <p className="text-text-muted text-lg">
            Asnjë artikull në këtë kategori ende.
          </p>
        </div>
      )}
    </div>
  );
}
