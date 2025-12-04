"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { DrawdownChartProps } from "@/lib/types";

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; payload: { date: string; value: number; drawdown: number } }[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-card p-3 text-sm">
        <p className="text-white/60 text-xs mb-1">{data.date}</p>
        <p className="text-white">
          Value: <span className="text-neon-green font-medium">{data.value.toFixed(3)}</span>
        </p>
        <p className="text-white">
          Drawdown:{" "}
          <span className={`font-medium ${data.drawdown < 0 ? "text-red-400" : "text-neon-green"}`}>
            {(data.drawdown * 100).toFixed(2)}%
          </span>
        </p>
      </div>
    );
  }
  return null;
}

export default function DrawdownChart({ timeseries }: DrawdownChartProps) {
  const data = timeseries.dates.map((date, i) => ({
    date,
    value: timeseries.portfolioValues[i],
    drawdown: timeseries.drawdowns[i],
  }));

  // Format date for display
  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Only show every nth tick to avoid crowding
  const tickInterval = Math.ceil(data.length / 6);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-400/30 to-neon-green/30 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-aurora-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">Portfolio Performance & Drawdown</h3>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
              interval={tickInterval}
            />

            <YAxis
              yAxisId="value"
              orientation="left"
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
              tickFormatter={(v) => v.toFixed(2)}
              domain={["auto", "auto"]}
            />

            <YAxis
              yAxisId="drawdown"
              orientation="right"
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              domain={["auto", 0]}
            />

            <Tooltip content={<CustomTooltip />} />

            <ReferenceLine
              yAxisId="value"
              y={1}
              stroke="rgba(255,255,255,0.2)"
              strokeDasharray="3 3"
            />

            <Area
              yAxisId="value"
              type="monotone"
              dataKey="value"
              stroke="#00ff88"
              strokeWidth={2}
              fill="url(#valueGradient)"
              style={{ filter: "drop-shadow(0 0 4px rgba(0,255,136,0.3))" }}
            />

            <Area
              yAxisId="drawdown"
              type="monotone"
              dataKey="drawdown"
              stroke="#ef4444"
              strokeWidth={1}
              fill="url(#drawdownGradient)"
              style={{ filter: "drop-shadow(0 0 4px rgba(239,68,68,0.3))" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-neon-green" />
          <span className="text-white/60">Portfolio Value (normalized)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <span className="text-white/60">Drawdown</span>
        </div>
      </div>
    </div>
  );
}

