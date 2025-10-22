"use client";

import { useState } from "react";
import { Shield, Wallet } from "lucide-react";
import { connectWallet } from "../lib/web3";

export default function Header({ walletConnected, setWalletConnected }) {
  const [address, setAddress] = useState("");
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const addr = await connectWallet();
      setAddress(addr);
      setWalletConnected(true);
    } catch (error) {
      console.error("Connection error:", error);
      alert("Failed to connect wallet. Please install MetaMask.");
    } finally {
      setConnecting(false);
    }
  };

  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Sentinel Oracle</h1>
              <p className="text-xs text-slate-400">AI-Powered DeFi Guardian</p>
            </div>
          </div>

          {/* Wallet Connection */}
          <div>
            {walletConnected ? (
              <div className="flex items-center space-x-2 bg-green-500/20 border border-green-500/50 rounded-lg px-4 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-sm font-medium">
                  {formatAddress(address)}
                </span>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Wallet className="w-4 h-4" />
                <span className="font-medium">
                  {connecting ? "Connecting..." : "Connect Wallet"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
