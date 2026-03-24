"use client";

import Link from "next/link";
import { CATEGORIES } from "@/lib/utils";

export default function Footer() {
  return (
    <footer className="bg-nav-bg mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand */}
          <div className="md:col-span-4">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-extrabold text-white tracking-tight">
                RAPORTI<span className="text-accent">.</span>
              </span>
            </Link>
            <p className="text-sm text-nav-text/60 leading-relaxed max-w-sm">
              Platforma juaj e besueshme për lajme të shpejta dhe të sakta në gjuhën shqipe.
              Lajme nga bota, politika, ekonomia dhe më shumë.
            </p>
          </div>

          {/* Categories - split into two columns */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold text-nav-text/40 mb-4 uppercase tracking-widest">
              Kategoritë
            </h3>
            <ul className="space-y-2.5">
              {CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/kategori/${cat.slug}`}
                    className="text-sm text-nav-text/60 hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-xs font-semibold text-nav-text/40 mb-4 uppercase tracking-widest">
              &nbsp;
            </h3>
            <ul className="space-y-2.5">
              {CATEGORIES.slice(5).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/kategori/${cat.slug}`}
                    className="text-sm text-nav-text/60 hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold text-nav-text/40 mb-4 uppercase tracking-widest">
              Newsletter
            </h3>
            <p className="text-sm text-nav-text/60 mb-4">
              Merrni lajmet kryesore direkt në emailin tuaj.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-2"
            >
              <input
                type="email"
                placeholder="Email juaj"
                className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-nav-text/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
              <button className="w-full px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg transition-colors">
                Abonohu
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-nav-text/40">
            &copy; {new Date().getFullYear()} Raporti. Të gjitha të drejtat e rezervuara.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xs text-nav-text/40 hover:text-white transition-colors">
              Kryefaqja
            </Link>
            <Link href="/kerko" className="text-xs text-nav-text/40 hover:text-white transition-colors">
              Kërko
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
