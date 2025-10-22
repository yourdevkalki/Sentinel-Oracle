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
agent_state = {
    "status": "initializing",
    "last_price": None,
    "last_z_score": None,
    "is_anomalous": False,
    "last_reason": "No data yet",
    "last_update": None,
    "price_history": deque(maxlen=50),
    "anomaly_count": 0,
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
    """Get current agent status"""
    return jsonify({
        "status": agent_state["status"],
        "last_price": agent_state["last_price"],
        "last_z_score": agent_state["last_z_score"],
        "is_anomalous": agent_state["is_anomalous"],
        "last_reason": agent_state["last_reason"],
        "last_update": agent_state["last_update"],
        "anomaly_count": agent_state["anomaly_count"],
        "uptime_start": agent_state["uptime_start"],
        "history_size": len(agent_state["price_history"])
    })


@app.route("/api/price-history", methods=["GET"])
def get_price_history():
    """Get price history"""
    return jsonify({
        "prices": list(agent_state["price_history"]),
        "count": len(agent_state["price_history"])
    })


@app.route("/api/chat", methods=["POST"])
def chat():
    """
    Chat with the AI agent (ASI:One simulation)
    Answers questions about price status and anomalies
    """
    data = request.get_json()
    message = data.get("message", "").lower()
    
    logger.info(f"Received chat message: {message}")
    
    # Simple rule-based responses (in production, integrate actual ASI:One)
    if "status" in message or "how" in message:
        if agent_state["is_anomalous"]:
            response = f"🚨 ALERT: I detected an anomaly! {agent_state['last_reason']}. The current BTC price is ${agent_state['last_price']:.2f}. I recommend caution."
        else:
            response = f"✅ Everything looks normal. BTC is trading at ${agent_state['last_price']:.2f} with a z-score of {agent_state['last_z_score']:.2f}. No anomalies detected."
    
    elif "safe" in message or "risk" in message:
        if agent_state["is_anomalous"]:
            response = "⚠️ HIGH RISK: Current price shows anomalous behavior. I recommend enabling stop-loss protection."
        else:
            response = "✅ LOW RISK: Market conditions appear stable. Your positions are safe for now."
    
    elif "why" in message or "explain" in message:
        if agent_state["is_anomalous"]:
            response = f"I detected an anomaly because: {agent_state['last_reason']}. This means the price moved significantly beyond normal volatility patterns. Using MeTTa reasoning, I calculated that the current price deviates {abs(agent_state['last_z_score']):.2f} standard deviations from the historical mean."
        else:
            response = "The current price is within normal ranges based on historical data. My statistical models show no significant deviations."
    
    elif "price" in message or "btc" in message:
        response = f"The current BTC/USD price is ${agent_state['last_price']:.2f}. Last updated: {agent_state['last_update']}"
    
    elif "hello" in message or "hi" in message:
        response = "👋 Hello! I'm Sentinel AI, your oracle guardian. I monitor BTC prices and detect anomalies using advanced statistical analysis. Ask me about price status, risks, or anomalies!"
    
    elif "help" in message:
        response = """I can help you with:
• Check current status: "How is BTC doing?"
• Risk assessment: "Is my position safe?"
• Explanations: "Why did you flag an anomaly?"
• Price info: "What's the current BTC price?"
        """
    
    else:
        response = f"I'm monitoring BTC/USD. Current price: ${agent_state['last_price']:.2f}. Ask me about status, risks, or anomalies!"
    
    return jsonify({
        "response": response,
        "timestamp": datetime.now().isoformat(),
        "agent_status": agent_state["status"],
        "is_anomalous": agent_state["is_anomalous"]
    })


@app.route("/api/update", methods=["POST"])
def update_state():
    """
    Internal endpoint for agent to update state
    (Called by the main agent process)
    """
    data = request.get_json()
    
    agent_state["status"] = data.get("status", agent_state["status"])
    agent_state["last_price"] = data.get("price")
    agent_state["last_z_score"] = data.get("z_score")
    agent_state["is_anomalous"] = data.get("is_anomalous", False)
    agent_state["last_reason"] = data.get("reason", "")
    agent_state["last_update"] = datetime.now().isoformat()
    
    if data.get("price"):
        agent_state["price_history"].append({
            "price": data["price"],
            "timestamp": agent_state["last_update"]
        })
    
    if data.get("is_anomalous"):
        agent_state["anomaly_count"] += 1
    
    return jsonify({"success": True})


def main():
    """Run the API server"""
    port = int(os.getenv("API_PORT", 8080))
    host = os.getenv("API_HOST", "0.0.0.0")
    
    logger.info(f"🚀 Starting Sentinel API Server on {host}:{port}")
    
    agent_state["status"] = "running"
    
    app.run(host=host, port=port, debug=False)


if __name__ == "__main__":
    main()

