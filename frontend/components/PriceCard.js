"use client";

import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export default function PriceCard({
  price,
  zScore,
  isAnomalous,
  lastUpdate,
  loading,
}) {
  const formatTime = (timestamp) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusColor = () => {
    if (isAnomalous) return "text-red-400";
    if (Math.abs(zScore) > 1.5) return "text-yellow-400";
    return "text-green-400";
  };

  const getStatusIcon = () => {
    if (isAnomalous) return <TrendingDown className="w-8 h-8 text-red-400" />;
    if (zScore > 0) return <TrendingUp className="w-8 h-8 text-green-400" />;
    return <Activity className="w-8 h-8 text-blue-400" />;
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 animate-pulse">
        <div className="h-12 bg-slate-700 rounded w-48 mb-4"></div>
        <div className="h-8 bg-slate-700 rounded w-32"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 shadow-2xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-slate-400 text-sm font-medium mb-2">
            BTC/USD Price
          </h2>
          <div className="flex items-baseline space-x-3">
            <span className={`text-5xl font-bold ${getStatusColor()}`}>
              ${price ? price.toFixed(2) : "--"}
            </span>
            {getStatusIcon()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-700">
        <div>
          <p className="text-slate-500 text-xs mb-1">Z-Score</p>
          <p className={`text-lg font-semibold ${getStatusColor()}`}>
            {zScore ? zScore.toFixed(2) : "--"}
          </p>
        </div>
        <div>
          <p className="text-slate-500 text-xs mb-1">Status</p>
          <p className={`text-lg font-semibold ${getStatusColor()}`}>
            {isAnomalous ? "Anomalous" : "Normal"}
          </p>
        </div>
        <div>
          <p className="text-slate-500 text-xs mb-1">Updated</p>
          <p className="text-slate-300 text-lg font-semibold">
            {formatTime(lastUpdate)}
          </p>
        </div>
      </div>

      {/* Live indicator */}
      <div className="flex items-center space-x-2 mt-6 pt-6 border-t border-slate-700">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-slate-400 text-sm">
          Live feed from Pyth Network
        </span>
      </div>
    </div>
  );
}
