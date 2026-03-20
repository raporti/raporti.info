"use client";

import Link from "next/link";
import { CATEGORIES } from "@/lib/utils";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-secondary mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-xl font-bold text-text-primary tracking-tight">
                RAPORTI
              </span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed">
              Platforma juaj e besueshme për lajme të shpejta dhe të sakta në gjuhën shqipe.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
              Kategoritë
            </h3>
            <ul className="space-y-2">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/kategori/${cat.slug}`}
                    className="text-sm text-text-muted hover:text-text-primary transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
              Navigimi
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-text-muted hover:text-text-primary transition-colors">
                  Kryefaqja
                </Link>
              </li>
              <li>
                <Link href="/kerko" className="text-sm text-text-muted hover:text-text-primary transition-colors">
                  Kërko
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter placeholder */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
              Newsletter
            </h3>
            <p className="text-sm text-text-muted mb-3">
              Regjistrohu për lajmet e fundit.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-2"
            >
              <input
                type="email"
                placeholder="Email juaj"
                className="flex-1 bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <button className="px-3 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-medium rounded-lg transition-colors">
                Abonohu
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} Raporti. Të gjitha të drejtat e rezervuara.
          </p>
          <p className="text-xs text-text-muted">
            Powered by AI journalism assistant
          </p>
        </div>
      </div>
    </footer>
  );
}
