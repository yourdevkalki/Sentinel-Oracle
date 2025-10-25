"use client";

import { useState } from "react";
import { Wallet, Shield, Settings, Lock, History } from "lucide-react";

export default function UserControlPanel({ walletConnected, userBalance = 0 }) {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [triggerCondition, setTriggerCondition] = useState("");
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [activeTab, setActiveTab] = useState("deposit");
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    setLoading(true);
    try {
      // TODO: Integrate with smart contract deposit function
      console.log("Depositing:", depositAmount);
      // Simulate deposit
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert(`✅ Deposited ${depositAmount} ETH successfully!`);
      setDepositAmount("");
    } catch (error) {
      console.error("Deposit error:", error);
      alert("❌ Deposit failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    setLoading(true);
    try {
      // TODO: Integrate with smart contract withdraw function
      console.log("Withdrawing:", withdrawAmount);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert(`✅ Withdrawn ${withdrawAmount} ETH successfully!`);
      setWithdrawAmount("");
    } catch (error) {
      console.error("Withdraw error:", error);
      alert("❌ Withdrawal failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEncryptTrigger = async () => {
    if (!triggerCondition.trim()) return;
    setLoading(true);
    try {
      // TODO: Integrate Lit Protocol encryption
      console.log("Encrypting trigger:", triggerCondition);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsEncrypted(true);
      alert("🔐 Trigger encrypted and stored successfully!");
    } catch (error) {
      console.error("Encryption error:", error);
      alert("❌ Encryption failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!walletConnected) {
    return (
      <div className="glassmorphism rounded-xl p-8 text-center border border-primary/20">
        <Wallet className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2 font-display">
          Connect Your Wallet
        </h3>
        <p className="text-[#F0F0F0]/80">
          Connect your wallet to deposit funds and set up automated protection.
        </p>
      </div>
    );
  }

  return (
    <div className="glassmorphism rounded-xl overflow-hidden border border-primary/30 glow-border-hover transition-all duration-300">
      {/* Header */}
      <div className="p-6 border-b border-primary/20">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold text-white font-display flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            Protection Controls
          </h3>
          <div className="text-right">
            <div className="text-xs text-[#F0F0F0]/60">Balance</div>
            <div className="text-xl font-bold text-accent-green font-display">
              {userBalance.toFixed(4)} ETH
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-4 bg-background-dark/30">
        <button
          onClick={() => setActiveTab("deposit")}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
            activeTab === "deposit"
              ? "bg-primary text-[#0A0A0A] shadow-[0_0_15px_rgba(0,225,255,0.4)]"
              : "text-[#F0F0F0]/60 hover:bg-primary/10 hover:text-primary"
          }`}
        >
          Deposit
        </button>
        <button
          onClick={() => setActiveTab("withdraw")}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
            activeTab === "withdraw"
              ? "bg-primary text-[#0A0A0A] shadow-[0_0_15px_rgba(0,225,255,0.4)]"
              : "text-[#F0F0F0]/60 hover:bg-primary/10 hover:text-primary"
          }`}
        >
          Withdraw
        </button>
        <button
          onClick={() => setActiveTab("automation")}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
            activeTab === "automation"
              ? "bg-primary text-[#0A0A0A] shadow-[0_0_15px_rgba(0,225,255,0.4)]"
              : "text-[#F0F0F0]/60 hover:bg-primary/10 hover:text-primary"
          }`}
        >
          Automation
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "deposit" && (
          <div className="space-y-5">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-[#F0F0F0]/90 text-sm leading-relaxed">
                Deposit funds to enable automated protection strategies powered
                by Lit Protocol and Vincent.
              </p>
            </div>
            <div className="space-y-3">
              <label className="text-white text-sm font-bold flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                Amount (ETH)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-background-dark/80 border-2 border-primary/30 rounded-lg px-4 py-4 text-white text-lg font-semibold placeholder-[#F0F0F0]/30 focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(0,225,255,0.2)] transition-all"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F0F0F0]/40 text-sm font-semibold">
                  ETH
                </div>
              </div>
            </div>
            <button
              onClick={handleDeposit}
              disabled={loading || !depositAmount}
              className="w-full bg-primary hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0A0A] py-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(0,225,255,0.4)] hover:shadow-[0_0_30px_rgba(0,225,255,0.6)] hover:scale-[1.02] active:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-[#0A0A0A]/30 border-t-[#0A0A0A] rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : (
                "Deposit Funds"
              )}
            </button>
          </div>
        )}

        {activeTab === "withdraw" && (
          <div className="space-y-5">
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm leading-relaxed font-semibold">
                ⚠️ Withdraw your deposited funds. Active automations will be
                disabled.
              </p>
            </div>
            <div className="space-y-3">
              <label className="text-white text-sm font-bold flex items-center gap-2">
                <Wallet className="w-4 h-4 text-red-400" />
                Amount (ETH)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={userBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-background-dark/80 border-2 border-red-500/30 rounded-lg px-4 py-4 text-white text-lg font-semibold placeholder-[#F0F0F0]/30 focus:outline-none focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F0F0F0]/40 text-sm font-semibold">
                  ETH
                </div>
              </div>
              <div className="text-xs text-[#F0F0F0]/60">
                Available:{" "}
                <span className="text-accent-green font-bold">
                  {userBalance.toFixed(4)} ETH
                </span>
              </div>
            </div>
            <button
              onClick={handleWithdraw}
              disabled={loading || !withdrawAmount || userBalance === 0}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:scale-[1.02] active:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : (
                "Withdraw Funds"
              )}
            </button>
          </div>
        )}

        {activeTab === "automation" && (
          <div className="space-y-5">
            <div className="flex items-start gap-3 p-4 bg-accent-violet/10 border border-accent-violet/30 rounded-lg">
              <div className="p-2 bg-accent-violet/20 rounded-lg flex-shrink-0">
                <Lock className="w-5 h-5 text-accent-violet" />
              </div>
              <div className="text-sm">
                <p className="text-accent-violet font-bold mb-1">
                  Privacy-Preserving Automation
                </p>
                <p className="text-[#F0F0F0]/80 leading-relaxed">
                  Your conditions are encrypted using Lit Protocol. They're only
                  decrypted when the conditions are met.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-white text-sm font-bold flex items-center gap-2">
                <Settings className="w-4 h-4 text-accent-violet" />
                Trigger Condition
              </label>
              <textarea
                value={triggerCondition}
                onChange={(e) => setTriggerCondition(e.target.value)}
                placeholder="e.g., If BTC drops >8% in 5 minutes, execute stop-loss"
                rows="4"
                className="w-full bg-background-dark/80 border-2 border-accent-violet/30 rounded-lg px-4 py-3 text-white placeholder-[#F0F0F0]/30 focus:outline-none focus:border-accent-violet focus:shadow-[0_0_15px_rgba(138,43,226,0.2)] transition-all resize-none"
              />
            </div>

            {isEncrypted && (
              <div className="flex items-center gap-3 p-4 bg-accent-green/10 border-2 border-accent-green/30 rounded-lg shadow-[0_0_20px_rgba(57,255,20,0.2)]">
                <div className="w-3 h-3 bg-accent-green rounded-full animate-pulse shadow-[0_0_10px] shadow-accent-green"></div>
                <span className="text-accent-green text-sm font-bold">
                  ✓ Active Protection Enabled
                </span>
              </div>
            )}

            <button
              onClick={handleEncryptTrigger}
              disabled={loading || !triggerCondition.trim() || isEncrypted}
              className="w-full bg-accent-violet hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(138,43,226,0.4)] hover:shadow-[0_0_30px_rgba(138,43,226,0.6)] hover:scale-[1.02] active:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Encrypting...
                </span>
              ) : isEncrypted ? (
                "✓ Protection Active"
              ) : (
                "🔐 Encrypt & Activate"
              )}
            </button>

            {isEncrypted && (
              <button
                onClick={() => {
                  setIsEncrypted(false);
                  setTriggerCondition("");
                }}
                className="w-full bg-red-600/20 hover:bg-red-600/30 border-2 border-red-600/40 text-red-400 py-3 rounded-lg font-bold text-sm transition-all duration-300 hover:border-red-600/60"
              >
                Disable Protection
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="border-t border-primary/20 p-4 bg-primary/5">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-[#F0F0F0]/60 mb-1">Status</div>
            <div className="flex items-center justify-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  isEncrypted ? "bg-accent-green" : "bg-yellow-500"
                } animate-pulse`}
              ></div>
              <span
                className={`text-sm font-semibold ${
                  isEncrypted ? "text-accent-green" : "text-yellow-500"
                }`}
              >
                {isEncrypted ? "Protected" : "Unprotected"}
              </span>
            </div>
          </div>
          <div>
            <div className="text-xs text-[#F0F0F0]/60 mb-1">Network</div>
            <div className="text-sm font-semibold text-primary">Sepolia</div>
          </div>
          <div>
            <div className="text-xs text-[#F0F0F0]/60 mb-1">Provider</div>
            <div className="text-sm font-semibold text-accent-violet">
              Lit + Vincent
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
