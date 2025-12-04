"use client";

import { ErrorAlertProps } from "@/lib/types";

export default function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <div className="glass-card border-red-500/30 p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <div className="flex-1">
          <h4 className="text-lg font-semibold text-red-400 mb-2">
            Analysis Failed
          </h4>
          <p className="text-white/70 text-sm mb-4 whitespace-pre-wrap">
            {message}
          </p>

          <div className="flex flex-wrap gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            )}
            <a
              href="https://finance.yahoo.com/lookup"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors text-sm"
            >
              Verify Ticker Symbols →
            </a>
          </div>

          {/* Help text */}
          <div className="mt-6 p-4 rounded-lg bg-white/5 text-sm">
            <p className="text-white/60 font-medium mb-2">Troubleshooting tips:</p>
            <ul className="text-white/50 space-y-1 list-disc list-inside">
              <li>Ensure ticker symbols are valid (e.g., AAPL, MSFT, VOO)</li>
              <li>Check that weights are formatted correctly (e.g., 30% or 0.30)</li>
              <li>Try with well-known, liquid stocks/ETFs first</li>
              <li>Some tickers may not have sufficient historical data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

