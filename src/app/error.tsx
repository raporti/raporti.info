"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Diçka shkoi keq
        </h1>
        <p className="text-sm text-text-muted mb-6">
          Ndodhi një gabim i papritur.
        </p>
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
        >
          Provo përsëri
        </button>
      </div>
    </div>
  );
}
