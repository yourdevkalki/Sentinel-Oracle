#!/usr/bin/env python3
"""
API Server for Sentinel AI Agent
Provides REST API for frontend to query agent status and interact via chat
"""

import os
import json
import logging
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from collections import deque

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SentinelAPI")

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Global state (in production, use Redis or similar)
# Multi-asset state tracking
supported_assets = ["BTC/USD", "ETH/USD", "SOL/USD", "AVAX/USD", "MATIC/USD"]

agent_state = {
    "status": "initializing",
    "assets": {
        asset: {
            "last_price": None,
            "last_z_score": None,
            "is_anomalous": False,
            "last_reason": "No data yet",
            "last_update": None,
            "price_history": deque(maxlen=50),
            "anomaly_count": 0,
        }
        for asset in supported_assets
    },
    "uptime_start": datetime.now().isoformat(),
}


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "agent": agent_state["status"]
    })


@app.route("/api/status", methods=["GET"])
def get_status():
    """Get current agent status for all assets"""
    # Convert deque objects to lists for JSON serialization
    serializable_assets = {}
    for asset, data in agent_state["assets"].items():
        serializable_assets[asset] = {
            "last_price": data["last_price"],
            "last_z_score": data["last_z_score"],
            "is_anomalous": data["is_anomalous"],
            "last_reason": data["last_reason"],
            "last_update": data["last_update"],
            "price_history": list(data["price_history"]),  # Convert deque to list
            "anomaly_count": data["anomaly_count"],
        }
    
    return jsonify({
        "status": agent_state["status"],
        "assets": serializable_assets,
        "uptime_start": agent_state["uptime_start"],
        "supported_assets": supported_assets
    })


@app.route("/api/price-history", methods=["GET"])
def get_price_history():
    """Get price history for all assets"""
    asset = request.args.get("asset", "BTC/USD")
    
    if asset not in supported_assets:
        return jsonify({"error": "Unsupported asset"}), 400
    
    asset_data = agent_state["assets"][asset]
    return jsonify({
        "asset": asset,
        "prices": list(asset_data["price_history"]),
        "count": len(asset_data["price_history"])
    })


@app.route("/api/chat", methods=["POST"])
def chat():
    """
    Chat with the AI agent (ASI:One simulation)
    Answers questions about price status and anomalies for all assets
    """
    data = request.get_json()
    message = data.get("message", "").lower()
    asset = data.get("asset", "BTC/USD")
    
    logger.info(f"Received chat message for {asset}: {message}")
    
    # Get asset data
    asset_data = agent_state["assets"].get(asset, {})
    
    # Simple rule-based responses (in production, integrate actual ASI:One)
    if "status" in message or "how" in message:
        if asset_data.get("is_anomalous"):
            response = f"🚨 ALERT: I detected an anomaly in {asset}! {asset_data.get('last_reason', 'Unknown reason')}. The current price is ${asset_data.get('last_price', 0):.2f}. I recommend caution."
        else:
            response = f"✅ Everything looks normal for {asset}. Price is ${asset_data.get('last_price', 0):.2f} with a z-score of {asset_data.get('last_z_score', 0):.2f}. No anomalies detected."
    
    elif "safe" in message or "risk" in message:
        if asset_data.get("is_anomalous"):
            response = f"⚠️ HIGH RISK: {asset} shows anomalous behavior. I recommend enabling stop-loss protection."
        else:
            response = f"✅ LOW RISK: {asset} market conditions appear stable. Your positions are safe for now."
    
    elif "why" in message or "explain" in message:
        if asset_data.get("is_anomalous"):
            response = f"I detected an anomaly in {asset} because: {asset_data.get('last_reason', 'Unknown reason')}. This means the price moved significantly beyond normal volatility patterns. Using MeTTa reasoning, I calculated that the current price deviates {abs(asset_data.get('last_z_score', 0)):.2f} standard deviations from the historical mean."
        else:
            response = f"The current {asset} price is within normal ranges based on historical data. My statistical models show no significant deviations."
    
    elif "price" in message or any(asset_symbol.split("/")[0].lower() in message for asset_symbol in supported_assets):
        response = f"The current {asset} price is ${asset_data.get('last_price', 0):.2f}. Last updated: {asset_data.get('last_update', 'Never')}"
    
    elif "hello" in message or "hi" in message:
        response = f"👋 Hello! I'm Sentinel AI, your oracle guardian. I monitor {len(supported_assets)} assets: {', '.join(supported_assets)}. I detect anomalies using advanced statistical analysis. Ask me about price status, risks, or anomalies!"
    
    elif "help" in message:
        response = f"""I can help you with:
• Check current status: "How is {asset} doing?"
• Risk assessment: "Is my {asset} position safe?"
• Explanations: "Why did you flag an anomaly?"
• Price info: "What's the current {asset} price?"
• Multi-asset overview: "Show me all assets"
        """
    
    elif "all" in message or "overview" in message:
        response = "📊 Multi-Asset Overview:\n"
        for asset_symbol in supported_assets:
            asset_info = agent_state["assets"][asset_symbol]
            status = "🚨 Anomalous" if asset_info.get("is_anomalous") else "✅ Normal"
            price = asset_info.get("last_price", 0)
            response += f"• {asset_symbol}: ${price:.2f} - {status}\n"
    
    else:
        response = f"I'm monitoring {asset}. Current price: ${asset_data.get('last_price', 0):.2f}. Ask me about status, risks, or anomalies!"
    
    return jsonify({
        "response": response,
        "timestamp": datetime.now().isoformat(),
        "agent_status": agent_state["status"],
        "asset": asset,
        "is_anomalous": asset_data.get("is_anomalous", False)
    })


@app.route("/api/update", methods=["POST"])
def update_state():
    """
    Internal endpoint for agent to update state for specific asset
    (Called by the main agent process)
    """
    data = request.get_json()
    asset = data.get("asset", "BTC/USD")
    
    if asset not in supported_assets:
        return jsonify({"error": "Unsupported asset"}), 400
    
    asset_data = agent_state["assets"][asset]
    
    # Update asset-specific data
    asset_data["last_price"] = data.get("price")
    asset_data["last_z_score"] = data.get("z_score")
    asset_data["is_anomalous"] = data.get("is_anomalous", False)
    asset_data["last_reason"] = data.get("reason", "")
    asset_data["last_update"] = datetime.now().isoformat()
    
    if data.get("price"):
        asset_data["price_history"].append({
            "price": data["price"],
            "timestamp": asset_data["last_update"]
        })
    
    if data.get("is_anomalous"):
        asset_data["anomaly_count"] += 1
    
    return jsonify({"success": True, "asset": asset})


def main():
    """Run the API server"""
    port = int(os.getenv("API_PORT", 8080))
    host = os.getenv("API_HOST", "0.0.0.0")
    
    logger.info(f"🚀 Starting Sentinel API Server on {host}:{port}")
    
    agent_state["status"] = "running"
    
    app.run(host=host, port=port, debug=False)


if __name__ == "__main__":
    main()

