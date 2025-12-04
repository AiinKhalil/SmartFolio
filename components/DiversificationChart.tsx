"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { DiversificationChartProps } from "@/lib/types";

const COLORS = [
  "#00ff88",
  "#00d4ff",
  "#a855f7",
  "#ec4899",
  "#f97316",
  "#fbbf24",
  "#2dd4bf",
  "#6366f1",
  "#8b5cf6",
  "#10b981",
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; payload: { ticker: string; name?: string } }[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="glass-card p-3 text-sm">
        <p className="font-semibold text-white">{data.payload.ticker}</p>
        {data.payload.name && (
          <p className="text-white/60 text-xs mb-1">{data.payload.name}</p>
        )}
        <p className="text-neon-green">
          {(data.value * 100).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
}

export default function DiversificationChart({
  holdings,
}: DiversificationChartProps) {
  const data = holdings
    .map((h) => ({
      ticker: h.ticker,
      name: h.name,
      weight: h.weight,
    }))
    .sort((a, b) => b.weight - a.weight);

  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-purple/30 to-neon-pink/30 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-neon-purple"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">Portfolio Weights</h3>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
          >
            <XAxis
              type="number"
              domain={[0, 1]}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
            />
            <YAxis
              type="category"
              dataKey="ticker"
              tick={{ fill: "rgba(255,255,255,0.8)", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
              width={50}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />
            <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  style={{
                    filter: `drop-shadow(0 0 4px ${COLORS[index % COLORS.length]}40)`,
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with holding names */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {data.slice(0, 6).map((h, i) => (
          <div key={h.ticker} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-white/70 truncate">
              {h.ticker}: {(h.weight * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

