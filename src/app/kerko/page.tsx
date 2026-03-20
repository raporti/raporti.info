import { prisma } from "@/lib/db";
import ArticleCard from "@/components/article/ArticleCard";
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
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-text-primary mb-4">
          Kërko Lajme
        </h1>
        <form action="/kerko" method="GET" className="flex gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Shkruani fjalën kyçe..."
              className="w-full pl-10 pr-4 py-2.5 bg-bg-card border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
          >
            Kërko
          </button>
        </form>
      </div>

      {query && (
        <p className="text-sm text-text-muted mb-6">
          {articles.length} rezultate për &ldquo;{query}&rdquo;
        </p>
      )}

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : query ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-text-muted">
            Asnjë rezultat për &ldquo;{query}&rdquo;
          </p>
        </div>
      ) : null}
    </div>
  );
}
