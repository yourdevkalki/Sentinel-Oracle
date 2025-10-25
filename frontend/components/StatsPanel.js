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

  const getAnomalyGlow = (label, value) => {
    if (label === "Anomalies Detected") {
      return value === 0 ? "success-glow" : "danger-pulse";
    }
    return "";
  };

  const getZScoreColor = (value) => {
    const score = parseFloat(value);
    if (score > 2) return "text-red-400";
    if (score > 1.5) return "text-yellow-400";
    return "text-accent-green";
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {statCards.map((stat, idx) => (
        <div
          key={idx}
          className={`glassmorphism rounded-xl p-6 glow-border-hover transition-all duration-300 hover:scale-105 ${getAnomalyGlow(
            stat.label,
            stat.value
          )}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#F0F0F0]/60 text-xs font-semibold uppercase tracking-wide">
              {stat.label}
            </span>
            <div
              className={`${stat.bgColor} p-2 rounded-lg transition-transform hover:rotate-12`}
            >
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
          <p
            className={`text-3xl font-bold font-display ${
              stat.label === "Avg Z-Score"
                ? getZScoreColor(stat.value)
                : stat.color
            }`}
          >
            {stat.value}
          </p>
          {stat.label === "Anomalies Detected" && stat.value === 0 && (
            <p className="text-xs text-accent-green/80 mt-2 font-semibold">
              ✓ All Clear
            </p>
          )}
          {stat.label === "Anomalies Detected" && stat.value > 0 && (
            <p className="text-xs text-red-400/80 mt-2 font-semibold animate-pulse">
              ⚠️ Attention Required
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
