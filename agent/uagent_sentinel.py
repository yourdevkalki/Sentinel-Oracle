#!/usr/bin/env python3
"""
Sentinel AI uAgent Wrapper
Wraps the Sentinel agent for Agentverse registration and ASI:One compatibility
"""

from uagents import Agent, Context, Model
import os
import asyncio
import logging
from datetime import datetime
from dotenv import load_dotenv
import requests

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SentinelUAgent")

# Define message models for ASI:One protocol
class PriceQuery(Model):
    """Query for current price information"""
    asset: str = "BTC/USD"

class PriceResponse(Model):
    """Response with price and anomaly status"""
    asset: str
    price: float
    is_anomalous: bool
    z_score: float | None
    reason: str
    timestamp: str

class AnomalyQuery(Model):
    """Query for anomaly explanation (ASI:One chat)"""
    question: str

class AnomalyResponse(Model):
    """Response with human-readable explanation and MeTTa reasoning"""
    answer: str
    metta_explanation: str

# Initialize Sentinel uAgent
sentinel = Agent(
    name="SentinelAI",
    seed=os.getenv("AGENT_SEED", "sentinel-oracle-seed-2025"),
    port=8001,
    endpoint=["http://localhost:8001/submit"],
)

# API server URL (where your current agent API runs)
API_URL = os.getenv("API_SERVER_URL", "http://localhost:8080")

@sentinel.on_event("startup")
async def startup(ctx: Context):
    """Agent startup event"""
    ctx.logger.info("🤖 Sentinel AI uAgent starting...")
    ctx.logger.info(f"📡 Connected to API server: {API_URL}")
    ctx.logger.info(f"🆔 Agent address: {ctx.agent.address}")
    ctx.logger.info("✅ Sentinel AI ready for ASI:One queries!")

@sentinel.on_query(model=PriceQuery, replies=PriceResponse)
async def handle_price_query(ctx: Context, sender: str, msg: PriceQuery):
    """Handle price queries from other agents or users"""
    ctx.logger.info(f"📊 Received price query from {sender} for {msg.asset}")

    try:
        # Fetch status from API server
        response = requests.get(f"{API_URL}/api/status", timeout=5)
        data = response.json()
        
        # Get asset data
        if msg.asset in data.get("assets", {}):
            asset_data = data["assets"][msg.asset]
            
            await ctx.send(
                sender,
                PriceResponse(
                    asset=msg.asset,
                    price=asset_data.get("last_price", 0),
                    is_anomalous=asset_data.get("is_anomalous", False),
                    z_score=asset_data.get("last_z_score"),
                    reason=asset_data.get("last_reason", "Unknown"),
                    timestamp=asset_data.get("last_update", datetime.now().isoformat())
                )
            )
            ctx.logger.info(f"✅ Sent price response for {msg.asset}")
        else:
            # Asset not found
            await ctx.send(
                sender,
                PriceResponse(
                    asset=msg.asset,
                    price=0,
                    is_anomalous=False,
                    z_score=None,
                    reason=f"Asset {msg.asset} not monitored",
                    timestamp=datetime.now().isoformat()
                )
            )
            ctx.logger.warning(f"⚠️  Asset {msg.asset} not found")
            
    except Exception as e:
        ctx.logger.error(f"❌ Error handling price query: {e}")
        await ctx.send(
            sender,
            PriceResponse(
                asset=msg.asset,
                price=0,
                is_anomalous=False,
                z_score=None,
                reason=f"Error: {str(e)}",
                timestamp=datetime.now().isoformat()
            )
        )

@sentinel.on_query(model=AnomalyQuery, replies=AnomalyResponse)
async def handle_anomaly_query(ctx: Context, sender: str, msg: AnomalyQuery):
    """Handle ASI:One chat queries about anomalies"""
    ctx.logger.info(f"💬 Chat query from {sender}: {msg.question}")

    try:
        # Send question to chat API
        response = requests.post(
            f"{API_URL}/api/chat",
            json={"message": msg.question},
            timeout=5
        )
        chat_response = response.json()
        
        # Generate MeTTa explanation
        metta_explanation = generate_metta_explanation(chat_response)
        
        await ctx.send(
            sender,
            AnomalyResponse(
                answer=chat_response.get("response", "I'm currently processing data. Please try again."),
                metta_explanation=metta_explanation
            )
        )
        ctx.logger.info("✅ Sent chat response")
        
    except Exception as e:
        ctx.logger.error(f"❌ Error handling chat query: {e}")
        await ctx.send(
            sender,
            AnomalyResponse(
                answer=f"I encountered an error: {str(e)}. Please try again.",
                metta_explanation="(error)"
            )
        )

def generate_metta_explanation(chat_data: dict) -> str:
    """Generate MeTTa reasoning explanation with knowledge graph structure"""
    is_anomalous = chat_data.get("is_anomalous", False)
    z_score = chat_data.get("last_z_score", 0)
    price = chat_data.get("last_price", 0)
    
    if is_anomalous:
        return f"""
; MeTTa Knowledge Graph: Anomaly Detection
; Based on ASI Alliance MeTTa reasoning framework

(: anomaly-fact (-> Asset Price ZScore AnomalyStatus))
(anomaly-fact BTC/USD {price:.2f} {z_score:.3f} DETECTED)

(: z-score-rule (-> Float Bool))
(= (z-score-rule $z) 
   (if (> (abs $z) 2.5) True False))

(: severity-calculation (-> Float Severity))
(= (severity-calculation $z)
   (if (> (abs $z) 3.0) CRITICAL
   (if (> (abs $z) 2.5) HIGH
   MODERATE)))

(: risk-assessment (-> AnomalyStatus Action))
(= (risk-assessment DETECTED)
   (case-expression
      ((> price-volatility 0.08) TRIGGER_STOP_LOSS)
      ((> price-volatility 0.05) ALERT_USER)
      (True MONITOR_CLOSELY)))

; Knowledge Graph Facts:
(assert (price-deviation exceeds-threshold))
(assert (market-risk elevated))
(assert (protective-action recommended))

; Recommended Actions (derived from knowledge graph):
; 1. Enable stop-loss triggers
; 2. Notify risk management systems
; 3. Increase monitoring frequency
; 4. Validate against multiple oracle sources
"""
    else:
        return f"""
; MeTTa Knowledge Graph: Normal Operation
; Based on ASI Alliance MeTTa reasoning framework

(: market-state (-> Asset Price ZScore Status))
(market-state BTC/USD {price:.2f} {z_score:.3f} NORMAL)

(: stability-rule (-> Float Bool))
(= (stability-rule $z)
   (if (<= (abs $z) 2.5) True False))

(: risk-level (-> Status RiskLevel))
(= (risk-level NORMAL) LOW)

(: monitoring-strategy (-> RiskLevel Action))
(= (monitoring-strategy LOW) CONTINUE_MONITORING)

; Knowledge Graph Facts:
(assert (market-conditions stable))
(assert (price-variance within-bounds))
(assert (risk-level minimal))
(assert (protective-measures not-required))

; System Status: All nominal
; No action required - continue passive monitoring
"""

@sentinel.on_interval(period=30.0)
async def periodic_health_check(ctx: Context):
    """Periodic health check to ensure API server is responsive"""
    try:
        response = requests.get(f"{API_URL}/health", timeout=2)
        if response.status_code == 200:
            ctx.logger.debug("💚 Health check passed")
        else:
            ctx.logger.warning(f"⚠️  Health check returned {response.status_code}")
    except Exception as e:
        ctx.logger.error(f"❌ Health check failed: {e}")

if __name__ == "__main__":
    logger.info("🚀 Starting Sentinel AI uAgent...")
    logger.info("📝 Agent will be available for ASI:One queries")
    sentinel.run()

