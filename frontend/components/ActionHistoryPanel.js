"use client";

import { useState } from "react";
import {
  History,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function ActionHistoryPanel() {
  // Mock action history - replace with real data
  const [actions] = useState([
    {
      id: 1,
      type: "Stop Loss Executed",
      asset: "BTC/USD",
      trigger: "Price dropped >8%",
      amount: "0.5 ETH",
      status: "success",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      txHash: "0x1234...5678",
    },
    {
      id: 2,
      type: "Anomaly Detected",
      asset: "ETH/USD",
      trigger: "Z-Score > 2.5",
      amount: "-",
      status: "warning",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      txHash: null,
    },
    {
      id: 3,
      type: "Rebalance Triggered",
      asset: "SOL/USD",
      trigger: "Portfolio drift >10%",
      amount: "1.2 ETH",
      status: "success",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      txHash: "0xabcd...efgh",
    },
  ]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-accent-green" />;
      case "warning":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-[#F0F0F0]/60" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "border-accent-green/30 bg-accent-green/5";
      case "warning":
        return "border-yellow-500/30 bg-yellow-500/5";
      case "failed":
        return "border-red-500/30 bg-red-500/5";
      default:
        return "border-primary/30 bg-primary/5";
    }
  };

  return (
    <div className="glassmorphism rounded-xl overflow-hidden border border-primary/30 glow-border-hover transition-all duration-300">
      {/* Header */}
      <div className="p-6 border-b border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <History className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-white font-display">
            Action History
          </h3>
        </div>
        <p className="text-[#F0F0F0]/70 text-sm">
          Recent automated actions and detections
        </p>
      </div>

      {/* Action List */}
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        {actions.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-[#F0F0F0]/20 mx-auto mb-3" />
            <p className="text-[#F0F0F0]/60">No actions yet</p>
            <p className="text-[#F0F0F0]/40 text-sm mt-1">
              Automated actions will appear here
            </p>
          </div>
        ) : (
          actions.map((action) => (
            <div
              key={action.id}
              className={`border-2 rounded-xl p-4 transition-all hover:shadow-[0_0_20px_rgba(0,225,255,0.15)] hover:scale-[1.01] ${getStatusColor(
                action.status
              )}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(action.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-white font-bold text-sm">
                        {action.type}
                      </h4>
                      <span className="text-xs text-primary font-mono bg-primary/20 px-2 py-1 rounded font-semibold border border-primary/30">
                        {action.asset}
                      </span>
                    </div>
                    <p className="text-[#F0F0F0]/80 text-xs mb-3 leading-relaxed">
                      {action.trigger}
                    </p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-[#F0F0F0]/60 font-semibold">
                        {formatTime(action.timestamp)}
                      </span>
                      {action.amount !== "-" && (
                        <>
                          <span className="text-[#F0F0F0]/30">•</span>
                          <span className="text-accent-green font-bold">
                            {action.amount}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {action.txHash && (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${action.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-all hover:scale-110 flex-shrink-0"
                    title="View on Etherscan"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="border-t border-primary/20 p-5 bg-background-dark/30">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-accent-green font-display">
              {actions.filter((a) => a.status === "success").length}
            </div>
            <div className="text-xs text-[#F0F0F0]/60">Successful</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-500 font-display">
              {actions.filter((a) => a.status === "warning").length}
            </div>
            <div className="text-xs text-[#F0F0F0]/60">Warnings</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary font-display">
              {actions.length}
            </div>
            <div className="text-xs text-[#F0F0F0]/60">Total</div>
          </div>
        </div>
      </div>
    </div>
  );
}
