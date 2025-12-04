"use client";

import { useState } from "react";
import { PortfolioInputCardProps } from "@/lib/types";

const EXAMPLE_PORTFOLIO = `AAPL 25%
MSFT 20%
GOOGL 15%
NVDA 15%
VOO 25%`;

export default function PortfolioInputCard({
  onAnalyze,
  isLoading,
}: PortfolioInputCardProps) {
  const [holdingsText, setHoldingsText] = useState("");
  const [portfolioValue, setPortfolioValue] = useState<string>("10000");
  const [showExample, setShowExample] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (holdingsText.trim()) {
      onAnalyze(holdingsText, parseFloat(portfolioValue) || 10000);
    }
  };

  const loadExample = () => {
    setHoldingsText(EXAMPLE_PORTFOLIO);
    setShowExample(false);
  };

  return (
    <div className="glass-card glass-card-hover p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-green/30 to-aurora-500/30 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-neon-green"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Enter Your Portfolio</h2>
          <p className="text-white/60 text-sm">Paste your holdings below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Holdings textarea */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-white/70 font-medium">
              Holdings
            </label>
            <button
              type="button"
              onClick={loadExample}
              className="text-xs text-neon-green/80 hover:text-neon-green transition-colors"
            >
              Load example portfolio
            </button>
          </div>
          <textarea
            value={holdingsText}
            onChange={(e) => setHoldingsText(e.target.value)}
            placeholder={`Enter one holding per line:\nAAPL 30%\nNVDA 20%\nVOO 50%`}
            className="input-field h-40 resize-none font-mono text-sm"
            disabled={isLoading}
          />
          <div className="mt-2 text-xs text-white/40">
            Format: <code className="text-aurora-400">TICKER weight%</code> or{" "}
            <code className="text-aurora-400">TICKER 0.XX</code>
          </div>
        </div>

        {/* Portfolio value input */}
        <div>
          <label className="text-sm text-white/70 font-medium mb-2 block">
            Portfolio Value (optional)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
              $
            </span>
            <input
              type="number"
              value={portfolioValue}
              onChange={(e) => setPortfolioValue(e.target.value)}
              className="input-field pl-8"
              placeholder="10000"
              min="0"
              step="100"
              disabled={isLoading}
            />
          </div>
          <div className="mt-2 text-xs text-white/40">
            Used for VaR calculation. Default: $10,000
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading || !holdingsText.trim()}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            holdingsText.trim() && !isLoading
              ? "bg-gradient-to-r from-neon-green to-aurora-500 text-midnight-950 shadow-lg shadow-neon-green/30 hover:shadow-xl hover:shadow-neon-green/40 hover:scale-[1.02] active:scale-[0.98] animate-glow"
              : "bg-white/10 text-white/40 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin w-5 h-5"
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
              Analyzing Portfolio...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              Analyze Portfolio
            </>
          )}
        </button>
      </form>

      {/* Disclaimer */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <p className="text-xs text-white/40 text-center">
          📊 Educational analysis only. Not financial advice. Past performance
          doesn&apos;t guarantee future results.
        </p>
      </div>
    </div>
  );
}

