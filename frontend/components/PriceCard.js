"use client";

import { TrendingUp, TrendingDown, Activity, Info } from "lucide-react";
import { useState } from "react";

export default function PriceCard({
  asset,
  price,
  zScore,
  isAnomalous,
  lastUpdate,
  loading,
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const formatTime = (timestamp) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusColor = () => {
    if (isAnomalous) return "text-red-400";
    if (Math.abs(zScore) > 1.5) return "text-yellow-400";
    return "text-accent-green";
  };

  const getZScoreColor = () => {
    const absZ = Math.abs(zScore);
    if (absZ > 2) return "z-score-danger";
    if (absZ > 1.5) return "z-score-caution";
    return "z-score-safe";
  };

  const getZScoreRiskLevel = () => {
    const absZ = Math.abs(zScore);
    if (absZ > 2.5) return "Critical";
    if (absZ > 2) return "High";
    if (absZ > 1.5) return "Moderate";
    return "Low";
  };

  const getStatusIcon = () => {
    if (isAnomalous) return <TrendingDown className="w-8 h-8 text-red-400" />;
    if (zScore > 0) return <TrendingUp className="w-8 h-8 text-accent-green" />;
    return <Activity className="w-8 h-8 text-primary" />;
  };

  if (loading) {
    return (
      <div className="glassmorphism rounded-xl p-8 animate-pulse">
        <div className="h-12 bg-primary/20 rounded w-48 mb-4"></div>
        <div className="h-8 bg-primary/20 rounded w-32"></div>
      </div>
    );
  }

  return (
    <div className="glassmorphism rounded-xl p-6 shadow-2xl glow-border-hover transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
      {/* Shimmer Effect Overlay 'shimmer'*/}
      <div className="absolute inset-0  pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="w-full">
            <h2 className="text-[#F0F0F0]/60 text-sm font-medium mb-3 font-display">
              {asset || "BTC/USD"} Price
            </h2>
            <div className="flex items-baseline space-x-3">
              <span
                className={`text-5xl font-bold font-display ${getStatusColor()}`}
              >
                ${price ? price.toFixed(2) : "--"}
              </span>
              <div className="transition-transform hover:scale-110">
                {getStatusIcon()}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-primary/20">
          {/* Z-Score with Tooltip */}
          <div className="relative">
            <div className="flex items-center gap-1 mb-2">
              <p className="text-[#F0F0F0]/50 text-xs">Z-Score</p>
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="text-[#F0F0F0]/40 hover:text-primary transition-colors"
              >
                <Info className="w-3 h-3" />
              </button>
            </div>
            <p
              className={`text-2xl font-bold font-display ${getZScoreColor()}`}
            >
              {zScore !== null && zScore !== undefined
                ? zScore.toFixed(2)
                : "--"}
            </p>
            <p className={`text-xs font-semibold mt-1 ${getZScoreColor()}`}>
              {zScore !== null ? getZScoreRiskLevel() : "N/A"}
            </p>

            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-background-dark border border-primary/30 rounded-lg shadow-xl z-50 animate-slide-up">
                <p className="text-xs text-[#F0F0F0]/90 leading-relaxed">
                  <span className="font-bold text-primary">Z-Score</span>{" "}
                  measures how many standard deviations the price is from the
                  mean. Higher values indicate unusual volatility.
                </p>
              </div>
            )}
          </div>

          <div>
            <p className="text-[#F0F0F0]/50 text-xs mb-2">Status</p>
            <p
              className={`text-lg font-semibold font-display ${getStatusColor()}`}
            >
              {isAnomalous ? "Anomalous" : "Normal"}
            </p>
          </div>

          <div>
            <p className="text-[#F0F0F0]/50 text-xs mb-2">Updated</p>
            <p className="text-[#F0F0F0] text-sm font-semibold">
              {formatTime(lastUpdate)}
            </p>
          </div>
        </div>

        {/* Live indicator with Enhanced Pulse */}
        <div className="flex items-center space-x-2 mt-6 pt-6 border-t border-primary/20">
          <div className="w-2 h-2 bg-primary rounded-full live-pulse shadow-[0_0_8px] shadow-primary"></div>
          <span className="text-[#F0F0F0]/70 text-sm font-medium">
            Live from Pyth
          </span>
        </div>
      </div>
    </div>
  );
}
