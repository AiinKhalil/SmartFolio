"use client";

export default function LoadingState() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl skeleton" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-48 skeleton rounded" />
            <div className="h-4 w-32 skeleton rounded" />
          </div>
        </div>
      </div>

      {/* Metrics grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-5">
            <div className="h-4 w-20 skeleton rounded mb-3" />
            <div className="h-8 w-24 skeleton rounded" />
          </div>
        ))}
      </div>

      {/* Charts row skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk gauge skeleton */}
        <div className="glass-card p-6 flex flex-col items-center">
          <div className="w-40 h-40 rounded-full skeleton" />
          <div className="h-6 w-24 skeleton rounded mt-4" />
        </div>

        {/* Charts skeleton */}
        <div className="glass-card p-6">
          <div className="h-6 w-32 skeleton rounded mb-4" />
          <div className="h-48 skeleton rounded" />
        </div>

        <div className="glass-card p-6">
          <div className="h-6 w-32 skeleton rounded mb-4" />
          <div className="h-48 skeleton rounded" />
        </div>
      </div>

      {/* Drawdown chart skeleton */}
      <div className="glass-card p-6">
        <div className="h-6 w-48 skeleton rounded mb-4" />
        <div className="h-64 skeleton rounded" />
      </div>

      {/* Diagnosis skeleton */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl skeleton" />
          <div className="space-y-2">
            <div className="h-5 w-32 skeleton rounded" />
            <div className="h-4 w-48 skeleton rounded" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full skeleton rounded" />
          <div className="h-4 w-5/6 skeleton rounded" />
          <div className="h-4 w-4/5 skeleton rounded" />
          <div className="h-4 w-full skeleton rounded" />
          <div className="h-4 w-3/4 skeleton rounded" />
        </div>
      </div>

      {/* Loading message */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-3 px-6 py-3 glass-card">
          <svg
            className="animate-spin w-5 h-5 text-neon-green"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <div className="text-left">
            <p className="text-white font-medium">Analyzing your portfolio...</p>
            <p className="text-white/50 text-sm">
              Fetching market data and computing metrics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

