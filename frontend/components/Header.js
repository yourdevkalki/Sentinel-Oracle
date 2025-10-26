"use client";

import { useState } from "react";
import Link from "next/link";
import { connectWallet } from "../lib/web3";
import { Copy, Check } from "lucide-react";

export default function Header({ walletConnected, setWalletConnected }) {
  const [address, setAddress] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pythConnected, setPythConnected] = useState(true); // You can make this dynamic

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
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-3 transition-all duration-300">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between whitespace-nowrap glassmorphism rounded-xl px-6 py-3">
          <Link
            href="/"
            className="flex items-center gap-3 text-white hover:opacity-90 transition-opacity"
          >
            <div className="size-6 text-primary">
              <svg
                fill="currentColor"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M24 6C14.058 6 6 14.058 6 24s8.058 18 18 18 18-8.058 18-18S33.942 6 24 6zm0 30c-6.627 0-12-5.373-12-12s5.373-12 12-12 12 5.373 12 12-5.373 12-12 12zm0-20c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"></path>
              </svg>
            </div>
            <h2 className="text-white text-lg font-bold font-display leading-tight tracking-[-0.015em]">
              Sentinel Oracle
            </h2>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-8">
              {/* Connection Status Indicator */}
              <div
                className="flex items-center gap-2 text-xs"
                title="Pyth Network Connection Status"
              >
                <div
                  className={`w-2 h-2 rounded-full live-pulse ${
                    pythConnected ? "bg-accent-green" : "bg-red-500"
                  }`}
                ></div>
                <span
                  className={`font-medium ${
                    pythConnected ? "text-accent-green" : "text-red-400"
                  }`}
                >
                  {pythConnected ? "Live" : "Disconnected"}
                </span>
              </div>

              <Link
                href="/"
                className="text-sm font-medium leading-normal hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium leading-normal text-primary"
              >
                Dashboard
              </Link>
              <a
                href="https://github.com/yourdevkalki/Sentinel-Oracle"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium leading-normal hover:text-primary transition-colors"
              >
                GitHub
              </a>
            </div>
            {walletConnected ? (
              <div className="flex items-center space-x-2 glassmorphism rounded-xl px-4 py-2 border border-primary/30">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-primary text-sm font-medium">
                  {formatAddress(address)}
                </span>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-5 bg-primary text-[#0A0A0A] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-opacity-90 transition-all duration-300 shadow-[0_0_15px_rgba(0,225,255,0.4)] hover:shadow-[0_0_25px_rgba(0,225,255,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span
                  className="material-symbols-outlined mr-2"
                  style={{ fontSize: "18px" }}
                >
                  account_balance_wallet
                </span>
                <span className="truncate">
                  {connecting ? "Connecting..." : "Connect Wallet"}
                </span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="material-symbols-outlined text-white">
              {isMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 glassmorphism rounded-xl px-6 py-4 animate-slide-up">
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                className="text-sm font-medium leading-normal hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium leading-normal text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <a
                href="https://github.com/yourdevkalki/Sentinel-Oracle"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium leading-normal hover:text-primary transition-colors"
              >
                GitHub
              </a>
              {walletConnected ? (
                <div className="flex items-center space-x-2 glassmorphism rounded-xl px-4 py-2 border border-primary/30">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-primary text-sm font-medium">
                    {formatAddress(address)}
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="w-full flex items-center justify-center overflow-hidden rounded-xl h-10 px-5 bg-primary text-[#0A0A0A] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-opacity-90 transition-all duration-300 shadow-[0_0_15px_rgba(0,225,255,0.4)] hover:shadow-[0_0_25px_rgba(0,225,255,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span
                    className="material-symbols-outlined mr-2"
                    style={{ fontSize: "18px" }}
                  >
                    account_balance_wallet
                  </span>
                  <span className="truncate">
                    {connecting ? "Connecting..." : "Connect Wallet"}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
