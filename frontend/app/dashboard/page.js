"use client";

import { useState, useEffect } from "react";
import Header from "../../components/Header";
import MultiAssetDashboard from "../../components/MultiAssetDashboard";
import AgentChat from "../../components/AgentChat";
import UserControlPanel from "../../components/UserControlPanel";
import ActionHistoryPanel from "../../components/ActionHistoryPanel";

export default function Dashboard() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [agentStatus, setAgentStatus] = useState({ status: "running" });
  const [userBalance, setUserBalance] = useState(0);

  // Fetch agent status
  useEffect(() => {
    const checkAgentStatus = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/status");
        if (response.ok) {
          setAgentStatus({ status: "running" });
        }
      } catch (error) {
        console.error("Agent status check failed:", error);
        setAgentStatus({ status: "offline" });
      }
    };

    checkAgentStatus();
    const interval = setInterval(checkAgentStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Simulate fetching user balance - replace with actual contract call
  useEffect(() => {
    if (walletConnected) {
      // TODO: Fetch actual balance from smart contract
      setUserBalance(0.0);
    }
  }, [walletConnected]);

  return (
    <div className="min-h-screen bg-background-dark">
      <Header
        walletConnected={walletConnected}
        setWalletConnected={setWalletConnected}
      />

      <div className="container mx-auto px-4 pb-8">
        <MultiAssetDashboard agentStatus={agentStatus} />

        {/* User Control & Automation Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserControlPanel
            walletConnected={walletConnected}
            userBalance={userBalance}
          />
          <ActionHistoryPanel />
        </div>
      </div>
    </div>
  );
}
