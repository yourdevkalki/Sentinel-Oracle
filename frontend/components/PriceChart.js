"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export default function PriceChart({ data, isAnomalous }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 h-80 flex items-center justify-center">
        <p className="text-slate-400">Loading price history...</p>
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    price: item.price,
  }));

  // Calculate mean for reference line
  const mean = data.reduce((sum, item) => sum + item.price, 0) / data.length;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">Price History</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-slate-400">Current Price</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-yellow-500"></div>
            <span className="text-slate-400">Mean</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="time"
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          />
          <YAxis
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            domain={["dataMin - 100", "dataMax + 100"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #475569",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#cbd5e1" }}
            itemStyle={{ color: "#3b82f6" }}
          />
          <ReferenceLine
            y={mean}
            stroke="#eab308"
            strokeDasharray="5 5"
            label={{ value: "Mean", fill: "#eab308", fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke={isAnomalous ? "#ef4444" : "#3b82f6"}
            strokeWidth={2}
            dot={{ fill: isAnomalous ? "#ef4444" : "#3b82f6", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
