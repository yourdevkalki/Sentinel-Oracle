"use client";

import { useState } from "react";
import Header from "../components/Header";
import MultiAssetDashboard from "../components/MultiAssetDashboard";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header
        walletConnected={walletConnected}
        setWalletConnected={setWalletConnected}
      />

      <MultiAssetDashboard />
    </div>
  );
}
