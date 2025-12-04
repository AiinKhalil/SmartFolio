"use client";

import { RiskGaugeProps } from "@/lib/types";

function getHealthLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Excellent", color: "#00ff88" };
  if (score >= 65) return { label: "Good", color: "#2dd4bf" };
  if (score >= 50) return { label: "Fair", color: "#fbbf24" };
  if (score >= 35) return { label: "Caution", color: "#f97316" };
  return { label: "At Risk", color: "#ef4444" };
}

function getVolatilityLabel(vol: number): string {
  if (vol < 0.1) return "Very Low";
  if (vol < 0.15) return "Low";
  if (vol < 0.2) return "Moderate";
  if (vol < 0.3) return "High";
  return "Very High";
}

export default function RiskGauge({ healthScore, volatility }: RiskGaugeProps) {
  const { label: healthLabel, color: healthColor } = getHealthLabel(healthScore);
  const volLabel = getVolatilityLabel(volatility);

  // Calculate the stroke-dashoffset for the progress ring
  // Circle circumference = 2 * PI * radius = 2 * PI * 45 = ~283
  const circumference = 283;
  const offset = circumference - (healthScore / 100) * circumference;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-green/30 to-aurora-500/30 flex items-center justify-center">
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
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">Health Score</h3>
      </div>

      <div className="flex flex-col items-center">
        {/* Circular gauge */}
        <div className="relative w-40 h-40">
          {/* Background ring */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
            />
            {/* Progress ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={healthColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="score-ring transition-all duration-1000 ease-out"
              style={{
                filter: `drop-shadow(0 0 8px ${healthColor})`,
              }}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-4xl font-bold"
              style={{ color: healthColor }}
            >
              {healthScore}
            </span>
            <span className="text-xs text-white/60 uppercase tracking-wider">
              / 100
            </span>
          </div>
        </div>

        {/* Health label */}
        <div
          className="mt-4 px-4 py-1.5 rounded-full text-sm font-medium"
          style={{
            backgroundColor: `${healthColor}20`,
            color: healthColor,
          }}
        >
          {healthLabel}
        </div>

        {/* Volatility indicator */}
        <div className="mt-6 w-full">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/60">Risk Level</span>
            <span className="text-white font-medium">{volLabel}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(volatility * 400, 100)}%`,
                background: `linear-gradient(90deg, #00ff88, #fbbf24, #ef4444)`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  );
}

