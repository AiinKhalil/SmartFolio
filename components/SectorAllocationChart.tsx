"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { SectorAllocationChartProps } from "@/lib/types";

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
  "#f43f5e",
  "#84cc16",
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; name: string }[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="glass-card p-3 text-sm">
        <p className="font-semibold text-white">{data.name}</p>
        <p className="text-neon-green">
          {(data.value * 100).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
}

interface CustomLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}

function renderCustomLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: CustomLabelProps) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function SectorAllocationChart({
  sectors,
}: SectorAllocationChartProps) {
  const data = sectors.map((s) => ({
    name: s.sector,
    value: s.weight,
  }));

  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue/30 to-aurora-400/30 flex items-center justify-center">
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
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">Sector Allocation</h3>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={80}
              innerRadius={40}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  style={{
                    filter: `drop-shadow(0 0 4px ${COLORS[index % COLORS.length]}40)`,
                  }}
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Sector legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {data.map((s, i) => (
          <div key={s.name} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-white/70 truncate">
              {s.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

