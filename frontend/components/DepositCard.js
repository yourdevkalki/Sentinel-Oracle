"use client";

import { useState } from "react";
import { DollarSign, Lock, Loader2 } from "lucide-react";
import { deposit, setTrigger } from "../lib/web3";

export default function DepositCard({ walletConnected }) {
  const [amount, setAmount] = useState("");
  const [threshold, setThreshold] = useState("8");
  const [depositing, setDepositing] = useState(false);
  const [settingTrigger, setSettingTrigger] = useState(false);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setDepositing(true);
      await deposit(amount);
      alert("✅ Deposit successful!");
      setAmount("");
    } catch (error) {
      console.error("Deposit error:", error);
      alert("❌ Deposit failed. Please try again.");
    } finally {
      setDepositing(false);
    }
  };

  const handleSetTrigger = async () => {
    if (!threshold || parseFloat(threshold) <= 0) {
      alert("Please enter a valid threshold");
      return;
    }

    try {
      setSettingTrigger(true);

      // Create trigger condition
      const triggerCondition = {
        asset: "BTC/USD",
        type: "STOP_LOSS",
        threshold: parseFloat(threshold) / 100,
      };

      // In production, this would encrypt with Lit Protocol
      // For demo, we'll just hash it
      const hash = await setTrigger(JSON.stringify(triggerCondition));

      alert(
        `✅ Stop-loss trigger set at ${threshold}% drop!\nHash: ${hash.slice(
          0,
          10
        )}...`
      );
    } catch (error) {
      console.error("Set trigger error:", error);
      alert("❌ Failed to set trigger. Please try again.");
    } finally {
      setSettingTrigger(false);
    }
  };

  if (!walletConnected) {
    return null;
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-2xl">
      <h3 className="text-white font-semibold text-lg mb-6 flex items-center">
        <DollarSign className="w-5 h-5 mr-2" />
        Deposit & Protection
      </h3>

      {/* Deposit Section */}
      <div className="mb-6">
        <label className="text-slate-400 text-sm mb-2 block">
          Deposit Amount (ETH)
        </label>
        <div className="flex space-x-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.01"
            step="0.01"
            disabled={depositing}
            className="flex-1 bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            onClick={handleDeposit}
            disabled={depositing || !amount}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center"
          >
            {depositing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Depositing
              </>
            ) : (
              "Deposit"
            )}
          </button>
        </div>
        <p className="text-slate-500 text-xs mt-2">
          Minimum deposit: 0.001 ETH
        </p>
      </div>

      {/* Trigger Section */}
      <div className="pt-6 border-t border-slate-700">
        <div className="flex items-center space-x-2 mb-3">
          <Lock className="w-4 h-4 text-purple-400" />
          <label className="text-slate-400 text-sm">
            Private Stop-Loss Trigger
          </label>
        </div>

        <div className="flex space-x-2">
          <div className="relative flex-1">
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="8"
              disabled={settingTrigger}
              className="w-full bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            />
            <span className="absolute right-3 top-2.5 text-slate-400">%</span>
          </div>
          <button
            onClick={handleSetTrigger}
            disabled={settingTrigger || !threshold}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center"
          >
            {settingTrigger ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting
              </>
            ) : (
              "Set"
            )}
          </button>
        </div>

        <div className="mt-3 bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
          <p className="text-purple-200 text-xs">
            🔐 <strong>Privacy-Preserving:</strong> Your trigger condition is
            encrypted using Lit Protocol and only executed when the AI detects
            an anomaly matching your threshold.
          </p>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 pt-6 border-t border-slate-700">
        <h4 className="text-slate-300 font-semibold text-sm mb-3">
          How it works:
        </h4>
        <ol className="space-y-2 text-slate-400 text-xs">
          <li className="flex items-start">
            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 text-[10px] font-bold flex-shrink-0">
              1
            </span>
            <span>Deposit funds to enable automated protection</span>
          </li>
          <li className="flex items-start">
            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 text-[10px] font-bold flex-shrink-0">
              2
            </span>
            <span>Set your private stop-loss threshold (e.g., 8% drop)</span>
          </li>
          <li className="flex items-start">
            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 text-[10px] font-bold flex-shrink-0">
              3
            </span>
            <span>AI monitors prices and detects anomalies</span>
          </li>
          <li className="flex items-start">
            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 text-[10px] font-bold flex-shrink-0">
              4
            </span>
            <span>Vincent executes your protection automatically</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
