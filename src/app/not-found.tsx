import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold text-text-primary mb-4">404</h1>
        <p className="text-lg text-text-secondary mb-6">
          Faqja që kërkuat nuk u gjet.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
        >
          Kthehu te kryefaqja
        </Link>
      </div>
    </div>
  );
}
