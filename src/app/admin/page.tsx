"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, FileText, Settings, LogOut, RefreshCw,
  Download, Check, X, Eye, RotateCcw,
  Zap, Clock, AlertTriangle, Archive,
} from "lucide-react";

interface Article {
  id: string;
  titleSq: string;
  subtitleSq: string | null;
  summarySq: string | null;
  bodySq: string;
  slug: string;
  category: string;
  urgency: string;
  status: string;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string | null;
  createdAt: string;
  telegramPost: {
    originalText: string;
    telegramPostUrl: string;
    channelName: string;
  };
}

interface Stats {
  totalPosts: number;
  unprocessedPosts: number;
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  rejectedArticles: number;
  activeSources: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ titleSq: "", bodySq: "", summarySq: "" });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [articlesRes, statsRes, meRes] = await Promise.all([
        fetch(`/api/articles?limit=100${filter !== "all" ? `&status=${filter}` : ""}`),
        fetch("/api/admin/stats"),
        fetch("/api/auth/me"),
      ]);

      if (meRes.status === 401) {
        router.push("/admin/login");
        return;
      }

      const articlesData = await articlesRes.json();
      const statsData = await statsRes.json();

      setArticles(articlesData.articles || []);
      setStats(statsData);
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [filter, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (action: string, articleId: string, body?: object) => {
    setActionLoading(articleId);
    try {
      if (action === "publish") {
        await fetch(`/api/articles/${articleId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "published" }),
        });
      } else if (action === "reject") {
        await fetch(`/api/articles/${articleId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "rejected" }),
        });
      } else if (action === "regenerate") {
        await fetch(`/api/articles/${articleId}/regenerate`, { method: "POST" });
      } else if (action === "update") {
        await fetch(`/api/articles/${articleId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      await fetchData();
      if (selectedArticle?.id === articleId) {
        const res = await fetch(`/api/articles/${articleId}`);
        const updated = await res.json();
        setSelectedArticle(updated);
      }
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleIngest = async () => {
    setActionLoading("ingest");
    try {
      await fetch("/api/ingest", { method: "POST" });
      await fetchData();
    } catch (err) {
      console.error("Ingest failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const openEdit = (article: Article) => {
    setEditForm({
      titleSq: article.titleSq,
      bodySq: article.bodySq,
      summarySq: article.summarySq || "",
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!selectedArticle) return;
    await handleAction("update", selectedArticle.id, editForm);
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    draft: "text-amber-400 bg-amber-400/10",
    published: "text-emerald-400 bg-emerald-400/10",
    rejected: "text-red-400 bg-red-400/10",
    pending: "text-blue-400 bg-blue-400/10",
  };

  const statusLabels: Record<string, string> = {
    draft: "Draft",
    published: "Publikuar",
    rejected: "Refuzuar",
    pending: "Në pritje",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-5 h-5 text-accent" />
          <h1 className="text-xl font-bold text-text-primary">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleIngest}
            disabled={actionLoading === "ingest"}
            className="flex items-center gap-1.5 px-3 py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            {actionLoading === "ingest" ? "Duke marrë..." : "Merr Postime"}
          </button>
          <Link
            href="/admin/settings"
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Publikuar", value: stats.publishedArticles, icon: Check, color: "text-emerald-400" },
            { label: "Draft", value: stats.draftArticles, icon: Clock, color: "text-amber-400" },
            { label: "Refuzuar", value: stats.rejectedArticles, icon: X, color: "text-red-400" },
            { label: "Pa procesuar", value: stats.unprocessedPosts, icon: AlertTriangle, color: "text-blue-400" },
          ].map((stat) => (
            <div key={stat.label} className="p-4 bg-bg-card border border-border rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-text-muted">{stat.label}</span>
              </div>
              <span className="text-2xl font-bold text-text-primary">{stat.value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Article list */}
        <div className="lg:col-span-2">
          {/* Filter */}
          <div className="flex items-center gap-2 mb-4">
            {["all", "draft", "published", "rejected"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filter === f
                    ? "bg-accent text-white"
                    : "bg-bg-card text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                }`}
              >
                {f === "all" ? "Të gjitha" : statusLabels[f] || f}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {articles.map((article) => (
              <button
                key={article.id}
                onClick={() => { setSelectedArticle(article); setEditing(false); }}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                  selectedArticle?.id === article.id
                    ? "bg-bg-hover border-accent/30"
                    : "bg-bg-card border-border hover:border-border-light hover:bg-bg-hover"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${statusColors[article.status] || ""}`}>
                    {statusLabels[article.status] || article.status}
                  </span>
                  <span className="text-[10px] text-text-muted">{article.category}</span>
                  {article.urgency === "breaking" && (
                    <Zap className="w-3 h-3 text-breaking" />
                  )}
                </div>
                <h3 className="text-sm font-medium text-text-primary line-clamp-2">
                  {article.titleSq}
                </h3>
                <p className="text-[11px] text-text-muted mt-1">
                  {new Date(article.createdAt).toLocaleDateString("sq-AL")}
                </p>
              </button>
            ))}
            {articles.length === 0 && (
              <p className="text-sm text-text-muted text-center py-8">
                Asnjë artikull
              </p>
            )}
          </div>
        </div>

        {/* Article detail / editor */}
        <div className="lg:col-span-3">
          {selectedArticle ? (
            <div className="bg-bg-card border border-border rounded-xl p-6">
              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {selectedArticle.status !== "published" && (
                  <button
                    onClick={() => handleAction("publish", selectedArticle.id)}
                    disabled={actionLoading === selectedArticle.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium rounded-lg transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Publiko
                  </button>
                )}
                {selectedArticle.status !== "rejected" && (
                  <button
                    onClick={() => handleAction("reject", selectedArticle.id)}
                    disabled={actionLoading === selectedArticle.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium rounded-lg transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Refuzo
                  </button>
                )}
                <button
                  onClick={() => handleAction("regenerate", selectedArticle.id)}
                  disabled={actionLoading === selectedArticle.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-medium rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Rigjenero
                </button>
                <button
                  onClick={() => editing ? saveEdit() : openEdit(selectedArticle)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent hover:bg-accent/20 text-xs font-medium rounded-lg transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {editing ? "Ruaj" : "Redakto"}
                </button>
                {selectedArticle.status === "published" && (
                  <Link
                    href={`/news/${selectedArticle.slug}`}
                    target="_blank"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-hover text-text-secondary hover:text-text-primary text-xs font-medium rounded-lg transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Shiko
                  </Link>
                )}
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">Titulli</label>
                    <input
                      value={editForm.titleSq}
                      onChange={(e) => setEditForm({ ...editForm, titleSq: e.target.value })}
                      className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">Përmbledhje</label>
                    <input
                      value={editForm.summarySq}
                      onChange={(e) => setEditForm({ ...editForm, summarySq: e.target.value })}
                      className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">Trupi i artikullit</label>
                    <textarea
                      value={editForm.bodySq}
                      onChange={(e) => setEditForm({ ...editForm, bodySq: e.target.value })}
                      rows={15}
                      className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  {/* Article preview */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusColors[selectedArticle.status]}`}>
                      {statusLabels[selectedArticle.status]}
                    </span>
                    <span className="text-xs text-text-muted">{selectedArticle.category}</span>
                    <span className="text-xs text-text-muted">•</span>
                    <span className="text-xs text-text-muted">{selectedArticle.urgency}</span>
                  </div>

                  <h2 className="text-xl font-bold text-text-primary mb-2">
                    {selectedArticle.titleSq}
                  </h2>

                  {selectedArticle.subtitleSq && (
                    <p className="text-sm text-text-secondary mb-3">
                      {selectedArticle.subtitleSq}
                    </p>
                  )}

                  {selectedArticle.summarySq && (
                    <div className="p-3 bg-bg-primary rounded-lg mb-4">
                      <p className="text-xs font-medium text-text-muted mb-1">Përmbledhje</p>
                      <p className="text-sm text-text-secondary">{selectedArticle.summarySq}</p>
                    </div>
                  )}

                  <div className="text-sm text-text-secondary leading-relaxed mb-6 max-h-60 overflow-y-auto">
                    {selectedArticle.bodySq.split("\n\n").map((p, i) => (
                      <p key={i} className="mb-3">{p}</p>
                    ))}
                  </div>

                  {/* Source info */}
                  <div className="p-3 bg-bg-primary rounded-lg mb-4">
                    <p className="text-xs font-medium text-text-muted mb-2">Burimi origjinal</p>
                    <p className="text-xs text-text-secondary mb-2 max-h-32 overflow-y-auto leading-relaxed">
                      {selectedArticle.telegramPost?.originalText}
                    </p>
                    <a
                      href={selectedArticle.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:text-accent-hover"
                    >
                      Shiko postimin origjinal →
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-bg-card border border-border rounded-xl p-12 flex flex-col items-center justify-center">
              <Archive className="w-8 h-8 text-text-muted mb-3" />
              <p className="text-sm text-text-muted">
                Zgjidhni një artikull për ta shikuar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
