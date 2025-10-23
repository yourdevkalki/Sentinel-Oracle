"use client";

import { Activity, TrendingUp, Clock, Shield } from "lucide-react";

export default function StatsPanel({ assets }) {
  const calculateStats = () => {
    if (!assets || assets.length === 0) {
      return {
        totalAssets: 0,
        anomalousAssets: 0,
        avgZScore: 0,
        lastUpdate: "Never",
      };
    }

    const anomalousAssets = assets.filter((asset) => asset.isAnomalous).length;
    const avgZScore =
      assets.reduce((sum, asset) => sum + Math.abs(asset.zScore), 0) /
      assets.length;
    const lastUpdate = Math.max(...assets.map((asset) => asset.lastUpdate));

    return {
      totalAssets: assets.length,
      anomalousAssets,
      avgZScore: avgZScore.toFixed(2),
      lastUpdate: new Date(lastUpdate).toLocaleTimeString(),
    };
  };

  const stats = calculateStats();

  const statCards = [
    {
      label: "Total Assets",
      value: stats.totalAssets,
      icon: Activity,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      label: "Anomalies Detected",
      value: stats.anomalousAssets,
      icon: TrendingUp,
      color: "text-red-400",
      bgColor: "bg-red-500/20",
    },
    {
      label: "Avg Z-Score",
      value: stats.avgZScore,
      icon: Clock,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
    },
    {
      label: "Last Update",
      value: stats.lastUpdate,
      icon: Shield,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, idx) => (
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
