"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import PriceCard from "../components/PriceCard";
import AnomalyAlert from "../components/AnomalyAlert";
import AgentChat from "../components/AgentChat";
import PriceChart from "../components/PriceChart";
import DepositCard from "../components/DepositCard";
import StatsPanel from "../components/StatsPanel";
import { fetchAgentStatus, fetchPriceHistory } from "../lib/api";

export default function Home() {
  const [agentStatus, setAgentStatus] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);

  // Fetch agent status periodically
  useEffect(() => {
    const updateData = async () => {
      try {
        const status = await fetchAgentStatus();
        setAgentStatus(status);

        const history = await fetchPriceHistory();
        setPriceHistory(history);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    updateData();
    const interval = setInterval(updateData, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header
        walletConnected={walletConnected}
        setWalletConnected={setWalletConnected}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Anomaly Alert */}
        {agentStatus?.is_anomalous && (
          <div className="mb-6">
            <AnomalyAlert
              reason={agentStatus.last_reason}
              timestamp={agentStatus.last_update}
              zScore={agentStatus.last_z_score}
            />
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Price & Chart */}
          <div className="lg:col-span-2 space-y-6">
            <PriceCard
              price={agentStatus?.last_price}
              zScore={agentStatus?.last_z_score}
              isAnomalous={agentStatus?.is_anomalous}
              lastUpdate={agentStatus?.last_update}
              loading={loading}
            />

            <PriceChart
              data={priceHistory}
              isAnomalous={agentStatus?.is_anomalous}
            />

            <StatsPanel agentStatus={agentStatus} />
          </div>

          {/* Right Column - Chat & Deposit */}
          <div className="space-y-6">
            <AgentChat agentStatus={agentStatus} />

            {walletConnected && (
              <DepositCard walletConnected={walletConnected} />
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-slate-400 text-sm">
          <p>
            Powered by{" "}
            <span className="text-blue-400 font-semibold">Pyth Network</span>,{" "}
            <span className="text-purple-400 font-semibold">ASI Alliance</span>,
            and{" "}
            <span className="text-green-400 font-semibold">Lit Protocol</span>
          </p>
          <p className="mt-2 text-xs">
            🔐 Privacy-preserving • 🤖 AI-powered • ⚡ Real-time monitoring
          </p>
        </div>
      </main>
    </div>
  );
}
