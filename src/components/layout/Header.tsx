"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Menu, X, ChevronRight } from "lucide-react";
import { CATEGORIES } from "@/lib/utils";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 bg-bg-primary shadow-sm">
      {/* Top red accent line */}
      <div className="h-1 bg-accent" />

      {/* Main header bar */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex items-center">
                <span className="text-2xl font-extrabold tracking-tight text-text-primary">
                  RAPORTI
                </span>
                <span className="text-accent text-3xl font-bold leading-none ml-0.5">.</span>
              </div>
            </Link>

            {/* Right side actions */}
            <div className="flex items-center gap-1">
              {/* Date display - desktop */}
              <span className="hidden lg:block text-xs text-text-muted mr-4">
                {new Date().toLocaleDateString("sq-AL", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>

              {/* Search toggle */}
              <button
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  setMenuOpen(false);
                }}
                className="p-2.5 text-text-secondary hover:text-accent rounded-lg transition-colors"
                aria-label="Kërko"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => {
                  setMenuOpen(!menuOpen);
                  setSearchOpen(false);
                }}
                className="md:hidden p-2.5 text-text-secondary hover:text-accent rounded-lg transition-colors"
                aria-label="Menu"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category navigation bar - desktop */}
      <nav className="hidden md:block bg-nav-bg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-0 overflow-x-auto">
            <Link
              href="/"
              className="px-4 py-3 text-sm font-medium text-nav-text/70 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap"
            >
              Kryefaqja
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/kategori/${cat.slug}`}
                className="px-4 py-3 text-sm font-medium text-nav-text/70 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Search bar overlay */}
      {searchOpen && (
        <div className="border-b border-border bg-bg-secondary">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/kerko?q=${encodeURIComponent(searchQuery)}`;
                }
              }}
              className="flex gap-3 max-w-2xl mx-auto"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Kërko lajme..."
                  className="w-full pl-10 pr-4 py-3 bg-bg-primary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Kërko
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-b border-border bg-bg-primary shadow-lg">
          <nav className="max-w-7xl mx-auto px-4 py-2">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between px-3 py-3 text-sm font-medium text-text-primary hover:text-accent hover:bg-bg-secondary rounded-lg transition-colors"
            >
              Kryefaqja
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/kategori/${cat.slug}`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-3 text-sm text-text-secondary hover:text-accent hover:bg-bg-secondary rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </span>
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
