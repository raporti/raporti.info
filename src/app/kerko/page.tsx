import { prisma } from "@/lib/db";
import ArticleCard from "@/components/article/ArticleCard";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Metadata } from "next";
import type { ArticleCard as ArticleCardType } from "@/types";

export const metadata: Metadata = {
  title: "Kërko Lajme",
  description: "Kërkoni lajme në raporti.info",
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  let articles: ArticleCardType[] = [];

  if (query) {
    articles = (await prisma.article.findMany({
      where: {
        status: "published",
        OR: [
          { titleSq: { contains: query, mode: "insensitive" } },
          { bodySq: { contains: query, mode: "insensitive" } },
          { summarySq: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { publishedAt: "desc" },
      take: 50,
      select: {
        id: true, titleSq: true, subtitleSq: true, summarySq: true,
        slug: true, category: true, urgency: true, featuredImage: true,
        imageMode: true, status: true, publishedAt: true, createdAt: true,
        sourceName: true, sourceUrl: true,
      },
    })) as ArticleCardType[];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <Link href="/" className="text-text-muted hover:text-accent transition-colors">
          Kryefaqja
        </Link>
        <span className="text-text-muted">/</span>
        <span className="font-medium text-text-primary">Kërko</span>
      </div>

      <div className="section-divider mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary">
          Kërko Lajme
        </h1>
      </div>

      <form action="/kerko" method="GET" className="flex gap-3 max-w-2xl mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Shkruani fjalën kyçe..."
            className="w-full pl-10 pr-4 py-3 bg-bg-primary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Kërko
        </button>
      </form>

      {query && (
        <p className="text-sm text-text-muted mb-6">
          {articles.length} rezultate për &ldquo;{query}&rdquo;
        </p>
      )}

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : query ? (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg text-text-muted">
            Asnjë rezultat për &ldquo;{query}&rdquo;
          </p>
          <p className="text-sm text-text-muted mt-2">
            Provoni me fjalë të tjera kyçe.
          </p>
        </div>
      ) : null}
    </div>
  );
}
