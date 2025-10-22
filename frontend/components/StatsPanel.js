"use client";

import { Activity, TrendingUp, Clock, Shield } from "lucide-react";

export default function StatsPanel({ agentStatus }) {
  const calculateUptime = () => {
    if (!agentStatus?.uptime_start) return "N/A";
    const start = new Date(agentStatus.uptime_start);
    const now = new Date();
    const diff = Math.floor((now - start) / 1000 / 60); // minutes

    if (diff < 60) return `${diff}m`;
    const hours = Math.floor(diff / 60);
    return `${hours}h ${diff % 60}m`;
  };

  const stats = [
    {
      label: "Agent Status",
      value: agentStatus?.status || "Unknown",
      icon: Activity,
      color:
        agentStatus?.status === "running" ? "text-green-400" : "text-gray-400",
      bgColor:
        agentStatus?.status === "running"
          ? "bg-green-500/20"
          : "bg-gray-500/20",
    },
    {
      label: "Anomalies Detected",
      value: agentStatus?.anomaly_count || 0,
      icon: TrendingUp,
      color: "text-red-400",
      bgColor: "bg-red-500/20",
    },
    {
      label: "Uptime",
      value: calculateUptime(),
      icon: Clock,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      label: "Samples Collected",
      value: agentStatus?.history_size || 0,
      icon: Shield,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs font-medium">
              {stat.label}
            </span>
            <div className={`${stat.bgColor} p-1.5 rounded-lg`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
