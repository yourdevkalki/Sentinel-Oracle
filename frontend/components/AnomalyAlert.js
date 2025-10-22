"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export default function AnomalyAlert({ reason, timestamp, zScore }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-red-500/10 border-2 border-red-500 rounded-xl p-6 animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="bg-red-500 p-2 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-red-400 font-bold text-lg mb-2">
              🚨 Anomaly Detected!
            </h3>
            <p className="text-red-300 mb-2">{reason}</p>
            <div className="flex items-center space-x-4 text-sm text-red-400/80">
              <span>Z-Score: {zScore?.toFixed(2)}</span>
              <span>•</span>
              <span>{new Date(timestamp).toLocaleString()}</span>
            </div>
            <div className="mt-3 bg-red-500/20 border border-red-500/30 rounded p-3">
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
