import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-7xl font-extrabold text-text-primary mb-2">404</h1>
        <p className="text-lg text-text-secondary mb-8">
          Faqja që kërkuat nuk u gjet.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Kthehu te kryefaqja
        </Link>
      </div>
    </div>
  );
}
