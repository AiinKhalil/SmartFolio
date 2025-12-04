"use client";

import { useState } from "react";
import PortfolioInputCard from "@/components/PortfolioInputCard";
import MetricsOverview from "@/components/MetricsOverview";
import RiskGauge from "@/components/RiskGauge";
import DiversificationChart from "@/components/DiversificationChart";
import SectorAllocationChart from "@/components/SectorAllocationChart";
import DrawdownChart from "@/components/DrawdownChart";
import DiagnosisPanel from "@/components/DiagnosisPanel";
import LoadingState from "@/components/LoadingState";
import ErrorAlert from "@/components/ErrorAlert";
import { AnalysisResponse, ErrorResponse } from "@/lib/types";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [lastInput, setLastInput] = useState<{
    holdingsText: string;
    portfolioValue: number;
  } | null>(null);

  const handleAnalyze = async (holdingsText: string, portfolioValue: number) => {
    setIsLoading(true);
    setError(null);
    setLastInput({ holdingsText, portfolioValue });

    try {
      const response = await fetch("/api/analyzePortfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          holdingsText,
          portfolioValue,
          horizonYears: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as ErrorResponse;
        throw new Error(
          errorData.details ? `${errorData.error}: ${errorData.details}` : errorData.error
        );
      }

      setAnalysis(data as AnalysisResponse);
    } catch (err) {
      setError((err as Error).message || "An unexpected error occurred");
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastInput) {
      handleAnalyze(lastInput.holdingsText, lastInput.portfolioValue);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-16 pb-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Logo/Icon */}
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 animate-float"
            style={{ 
              background: "linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(20, 184, 166, 0.2))",
              boxShadow: "0 0 30px rgba(0, 255, 136, 0.15)"
            }}
          >
            <svg
              className="w-10 h-10"
              style={{ color: "#00ff88" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span 
              style={{ 
                background: "linear-gradient(90deg, #00ff88, #00d4ff, #a855f7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              SmartFolio
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-2">
            Paste your portfolio and get a{" "}
            <span className="text-white/80">math-backed</span> risk &amp;
            diversification check in seconds by Aiin Khalilzadeh.
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-neon-green/10 text-neon-green border border-neon-green/20">
              Real Market Data
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-neon-blue/10 text-neon-blue border border-neon-blue/20">
              Quantitative Analysis
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-neon-purple/10 text-neon-purple border border-neon-purple/20">
              AI Insights
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Input Section */}
          <div className="mb-8">
            <div className="max-w-xl mx-auto">
              <PortfolioInputCard onAnalyze={handleAnalyze} isLoading={isLoading} />
            </div>
          </div>

          {/* Loading State */}
          {isLoading && <LoadingState />}

          {/* Error State */}
          {error && !isLoading && (
            <div className="mb-8">
              <ErrorAlert message={error} onRetry={handleRetry} />
            </div>
          )}

          {/* Results Dashboard */}
          {analysis && !isLoading && !error && (
            <div className="space-y-6 animate-fadeIn">
              {/* Portfolio Summary Header */}
              <div className="glass-card p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                  {/* Health Score Badge */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
                    style={{
                      background:
                        analysis.portfolio.healthScore >= 70
                          ? "linear-gradient(135deg, rgba(0,255,136,0.2), rgba(45,212,191,0.2))"
                          : analysis.portfolio.healthScore >= 50
                            ? "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(249,115,22,0.2))"
                            : "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(244,63,94,0.2))",
                      color:
                        analysis.portfolio.healthScore >= 70
                          ? "#00ff88"
                          : analysis.portfolio.healthScore >= 50
                            ? "#fbbf24"
                            : "#ef4444",
                    }}
                  >
                    {analysis.portfolio.healthScore}
                  </div>

                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-white mb-1">
                      Portfolio Analysis Complete
                    </h2>
                    <p className="text-white/60 text-sm">
                      Analyzed {analysis.holdings.length} holding
                      {analysis.holdings.length !== 1 ? "s" : ""} across{" "}
                      {analysis.sectors.length} sector
                      {analysis.sectors.length !== 1 ? "s" : ""} •{" "}
                      {analysis.timeseries.dates.length} trading days
                    </p>
                  </div>

                  {/* Quick stats */}
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-white/50">Return</span>
                      <p
                        className={`font-semibold ${analysis.portfolio.expectedAnnualReturn >= 0 ? "text-neon-green" : "text-red-400"}`}
                      >
                        {(analysis.portfolio.expectedAnnualReturn * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <span className="text-white/50">Risk</span>
                      <p className="font-semibold text-white">
                        {(analysis.portfolio.annualVolatility * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <span className="text-white/50">Sharpe</span>
                      <p className="font-semibold text-white">
                        {analysis.portfolio.sharpeRatio?.toFixed(2) || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics Overview */}
              <MetricsOverview portfolio={analysis.portfolio} />

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Risk Gauge */}
                <RiskGauge
                  healthScore={analysis.portfolio.healthScore}
                  volatility={analysis.portfolio.annualVolatility}
                />

                {/* Diversification Chart */}
                <DiversificationChart holdings={analysis.holdings} />

                {/* Sector Allocation */}
                <SectorAllocationChart sectors={analysis.sectors} />
              </div>

              {/* Drawdown Chart */}
              <DrawdownChart timeseries={analysis.timeseries} />

              {/* Holdings Table */}
              <div className="glass-card p-6 overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-green/30 to-neon-blue/30 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-neon-green"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Holdings Breakdown</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-white/50 text-left border-b border-white/10">
                        <th className="pb-3 font-medium">Ticker</th>
                        <th className="pb-3 font-medium">Name</th>
                        <th className="pb-3 font-medium">Sector</th>
                        <th className="pb-3 font-medium text-right">Weight</th>
                        <th className="pb-3 font-medium text-right">Return</th>
                        <th className="pb-3 font-medium text-right">Volatility</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.holdings.map((holding) => (
                        <tr
                          key={holding.ticker}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-3 font-mono font-semibold text-neon-green">
                            {holding.ticker}
                          </td>
                          <td className="py-3 text-white/80 truncate max-w-[150px]">
                            {holding.name || "-"}
                          </td>
                          <td className="py-3 text-white/60">{holding.sector || "-"}</td>
                          <td className="py-3 text-right text-white">
                            {(holding.weight * 100).toFixed(1)}%
                          </td>
                          <td
                            className={`py-3 text-right ${holding.annualReturn >= 0 ? "text-neon-green" : "text-red-400"}`}
                          >
                            {(holding.annualReturn * 100).toFixed(1)}%
                          </td>
                          <td className="py-3 text-right text-white/80">
                            {(holding.annualVol * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AI Diagnosis */}
              <DiagnosisPanel diagnosis={analysis.diagnosis} />
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-white/40 text-sm">
            Built with Next.js, TypeScript, and ❤️ •{" "}
            <span className="text-white/60">SmartFolio</span>
          </p>
          <p className="text-white/30 text-xs mt-2">
            Educational tool only. Not financial advice. Past performance does not
            guarantee future results.
          </p>
        </div>
      </footer>

      {/* Styles for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </main>
  );
}

