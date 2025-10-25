"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export default function AnomalyAlert({ asset }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !asset) return null;

  const getSeverityLevel = (zScore) => {
    const absZScore = Math.abs(zScore);
    if (absZScore > 3)
      return {
        level: "Critical",
        color: "text-red-400",
        bgColor: "bg-red-500/20",
      };
    if (absZScore > 2.5)
      return {
        level: "High",
        color: "text-orange-400",
        bgColor: "bg-orange-500/20",
      };
    return {
      level: "Medium",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
    };
  };

  const severity = getSeverityLevel(asset.zScore);

  return (
    <div className="glassmorphism border-2 border-red-500/50 rounded-xl p-6 animate-slide-up shadow-[0_0_20px_rgba(239,68,68,0.3)]">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="bg-red-500 p-2 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-red-400 font-bold text-lg mb-2 font-display">
              🚨 Anomaly Detected!
            </h3>
            <p className="text-red-300/90 mb-2">
              {asset.name} ({asset.symbol}) showing unusual price behavior
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-red-400/80">
              <span>Z-Score: {asset.zScore?.toFixed(2)}</span>
              <span>•</span>
              <span>Price: ${asset.price?.toFixed(2)}</span>
              <span>•</span>
              <span className="text-xs">
                {new Date(asset.lastUpdate).toLocaleString()}
              </span>
            </div>
            <div className="mt-3 bg-red-500/20 border border-red-500/30 rounded-xl p-3">
              <p className="text-red-200 text-sm">
                ⚠️ <strong>Recommendation:</strong> Consider activating
                stop-loss protection or monitoring your positions closely.
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-red-400 hover:text-red-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
