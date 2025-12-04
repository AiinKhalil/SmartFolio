"use client";

import { MetricsOverviewProps } from "@/lib/types";

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatNumber(value: number | null, decimals: number = 2): string {
  if (value === null) return "N/A";
  return value.toFixed(decimals);
}

interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
  colorClass?: string;
  icon?: React.ReactNode;
}

function MetricCard({ label, value, subtext, colorClass, icon }: MetricCardProps) {
  return (
    <div className="glass-card p-5 relative overflow-hidden group">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          {icon && <span className="text-white/60">{icon}</span>}
          <span className="stat-label">{label}</span>
        </div>
        <div className={`stat-value ${colorClass || "text-white"}`}>{value}</div>
        {subtext && (
          <div className="text-xs text-white/50 mt-1">{subtext}</div>
        )}
      </div>
    </div>
  );
}

export default function MetricsOverview({ portfolio }: MetricsOverviewProps) {
  const returnColorClass =
    portfolio.expectedAnnualReturn >= 0 ? "metric-positive" : "metric-negative";

  const sharpeColorClass =
    portfolio.sharpeRatio === null
      ? "text-white/60"
      : portfolio.sharpeRatio >= 1
        ? "metric-positive"
        : portfolio.sharpeRatio >= 0.5
          ? "metric-neutral"
          : portfolio.sharpeRatio >= 0
            ? "text-white"
            : "metric-negative";

  const volColorClass =
    portfolio.annualVolatility < 0.15
      ? "metric-positive"
      : portfolio.annualVolatility < 0.25
        ? "metric-neutral"
        : "metric-negative";

  const ddColorClass =
    portfolio.maxDrawdown > -0.1
      ? "metric-positive"
      : portfolio.maxDrawdown > -0.2
        ? "metric-neutral"
        : "metric-negative";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue/30 to-neon-purple/30 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-neon-blue"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">Key Metrics</h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Expected Return"
          value={formatPercent(portfolio.expectedAnnualReturn)}
          subtext="Annualized"
          colorClass={returnColorClass}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          }
        />

        <MetricCard
          label="Volatility"
          value={formatPercent(portfolio.annualVolatility)}
          subtext="Annualized std dev"
          colorClass={volColorClass}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
              />
            </svg>
          }
        />

        <MetricCard
          label="Sharpe Ratio"
          value={formatNumber(portfolio.sharpeRatio)}
          subtext="Risk-adjusted return"
          colorClass={sharpeColorClass}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
              />
            </svg>
          }
        />

        <MetricCard
          label="Max Drawdown"
          value={formatPercent(portfolio.maxDrawdown)}
          subtext="Peak to trough"
          colorClass={ddColorClass}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          }
        />
      </div>

      {/* Additional metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          label="Holdings"
          value={portfolio.numHoldings.toString()}
          subtext="Total positions"
        />

        <MetricCard
          label="Top Position"
          value={formatPercent(portfolio.topHoldingWeight)}
          subtext="Largest holding"
          colorClass={portfolio.topHoldingWeight > 0.4 ? "metric-neutral" : "text-white"}
        />

        {portfolio.var95 && (
          <MetricCard
            label="95% VaR (1-day)"
            value={`$${portfolio.var95.toFixed(0)}`}
            subtext="Potential daily loss"
            colorClass="metric-negative"
          />
        )}
      </div>
    </div>
  );
}

