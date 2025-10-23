"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import PriceCard from "./PriceCard";
import StatsPanel from "./StatsPanel";
import AnomalyAlert from "./AnomalyAlert";

// Asset mapping for display
const ASSET_MAPPING = {
  "BTC/USD": { name: "Bitcoin", symbol: "BTC" },
  "ETH/USD": { name: "Ethereum", symbol: "ETH" },
  "SOL/USD": { name: "Solana", symbol: "SOL" },
  "AVAX/USD": { name: "Avalanche", symbol: "AVAX" },
  "MATIC/USD": { name: "Polygon", symbol: "MATIC" },
};

export default function MultiAssetDashboard() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [anomalies, setAnomalies] = useState([]);
  const [error, setError] = useState(null);

  // Fetch real data from API
  const fetchAssetData = async () => {
    try {
      setError(null);
      console.log("Fetching data from API...");
      const response = await fetch("http://localhost:8080/api/status");
      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("API data received:", data);

      // Transform API data to match our component structure
      const transformedAssets = Object.entries(data.assets).map(
        ([assetId, assetData]) => {
          const mapping = ASSET_MAPPING[assetId] || {
            name: assetId,
            symbol: assetId.split("/")[0],
          };
          return {
            id: assetId,
            name: mapping.name,
            symbol: mapping.symbol,
            price: assetData.last_price,
            zScore:
              assetData.last_z_score !== null &&
              assetData.last_z_score !== undefined
                ? assetData.last_z_score
                : null,
            isAnomalous: assetData.is_anomalous,
            lastUpdate: assetData.last_update
              ? new Date(assetData.last_update).getTime()
              : Date.now(),
            reason: assetData.last_reason,
            anomalyCount: assetData.anomaly_count,
          };
        }
      );

      console.log("Transformed assets:", transformedAssets);
      setAssets(transformedAssets);
      setLastRefresh(Date.now());
    } catch (err) {
      console.error("Failed to fetch asset data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAssetData();
  }, []);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchAssetData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Update anomalies when assets change
  useEffect(() => {
    const newAnomalies = assets.filter((asset) => asset.isAnomalous);
    setAnomalies(newAnomalies);
  }, [assets]);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchAssetData();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleTimeString();
  };

  if (loading && assets.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading asset data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500/10 border-2 border-red-500 rounded-xl p-6 text-center">
          <h2 className="text-red-400 font-bold text-xl mb-4">
            ⚠️ Connection Error
          </h2>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={fetchAssetData}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Multi-Asset Oracle Dashboard
            </h1>
            <p className="text-slate-400">
              Real-time price monitoring with AI-powered anomaly detection
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-slate-400 text-sm">Last Updated</p>
              <p className="text-white font-medium">
                {formatTime(lastRefresh)}
              </p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>{loading ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsPanel assets={assets} />
      </div>

      {/* Anomaly Alerts */}
      {anomalies.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
            Active Anomalies ({anomalies.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {anomalies.map((asset) => (
              <AnomalyAlert key={asset.id} asset={asset} />
            ))}
          </div>
        </div>
      )}

      {/* Asset Price Cards */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-6">
          Asset Prices & Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {assets.map((asset) => (
            <PriceCard
              key={asset.id}
              asset={asset.name}
              price={asset.price}
              zScore={asset.zScore}
              isAnomalous={asset.isAnomalous}
              lastUpdate={asset.lastUpdate}
              loading={loading}
            />
          ))}
        </div>
      </div>

      {/* Additional Analytics Section */}
      <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Market Overview
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {assets.filter((a) => !a.isAnomalous).length}
            </div>
            <div className="text-slate-400">Normal Assets</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {assets.filter((a) => a.isAnomalous).length}
            </div>
            <div className="text-slate-400">Anomalous Assets</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {assets.length}
            </div>
            <div className="text-slate-400">Total Monitored</div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-700">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live feed from Pyth Network</span>
            </div>
            <div>Powered by Sentinel Oracle AI</div>
          </div>
        </div>
      </div>
    </div>
  );
}
