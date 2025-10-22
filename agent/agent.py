#!/usr/bin/env python3
"""
Sentinel AI Agent
AI-powered anomaly detection agent using ASI uAgent framework
Monitors Pyth price feeds and detects anomalies using statistical analysis
"""

import os
import time
import json
import logging
from datetime import datetime
from collections import deque
from typing import Dict, List, Optional
import numpy as np
import requests
from web3 import Web3
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("SentinelAI")


class AnomalyDetector:
    """Statistical anomaly detector using z-score method"""
    
    def __init__(self, window_size: int = 30, threshold: float = 2.5):
        self.window_size = window_size
        self.threshold = threshold
        self.price_history = deque(maxlen=window_size)
        
    def add_price(self, price: float) -> None:
        """Add a new price to the history"""
        self.price_history.append(price)
        
    def calculate_z_score(self, price: float) -> Optional[float]:
        """Calculate z-score for a given price"""
        if len(self.price_history) < 10:  # Need minimum samples
            return None
            
        mean = np.mean(self.price_history)
        std = np.std(self.price_history)
        
        if std == 0:
            return 0
            
        z_score = (price - mean) / std
        return z_score
        
    def is_anomaly(self, price: float) -> tuple[bool, Optional[float], str]:
        """
        Check if price is anomalous
        Returns: (is_anomalous, z_score, reason)
        """
        z_score = self.calculate_z_score(price)
        
        if z_score is None:
            return False, None, "Insufficient data"
            
        is_anomalous = abs(z_score) > self.threshold
        
        if is_anomalous:
            direction = "spike" if z_score > 0 else "drop"
            reason = f"Z-score {z_score:.2f} (>{self.threshold}σ {direction})"
            return True, z_score, reason
        else:
            return False, z_score, f"Normal (z={z_score:.2f})"


class MeTTaReasoner:
    """
    Simple MeTTa-inspired reasoning engine
    In production, this would use the actual MeTTa/Hyperon system
    """
    
    @staticmethod
    def reason_about_anomaly(z_score: float, price: float, mean: float) -> str:
        """Generate human-readable explanation using rule-based reasoning"""
        
        if abs(z_score) > 3.0:
            severity = "CRITICAL"
        elif abs(z_score) > 2.5:
            severity = "HIGH"
        else:
            severity = "MODERATE"
            
        change_pct = ((price - mean) / mean) * 100
        
        explanation = f"""
MeTTa Analysis:
- Severity: {severity}
- Z-Score: {z_score:.3f}
- Price Change: {change_pct:+.2f}%
- Current Price: ${price:.2f}
- Historical Mean: ${mean:.2f}
- Reasoning: Price deviated {abs(z_score):.2f} standard deviations from mean
- Risk Level: {'EXTREME' if abs(z_score) > 3 else 'HIGH' if abs(z_score) > 2.5 else 'MEDIUM'}
- Recommended Action: {'IMMEDIATE_STOP_LOSS' if abs(z_score) > 3 else 'MONITOR_CLOSELY'}
        """.strip()
        
        return explanation


class SentinelAgent:
    """Main Sentinel AI Agent"""
    
    def __init__(self):
        # Load configuration
        self.rpc_url = os.getenv("ETH_RPC_URL")
        self.contract_address = os.getenv("SENTINEL_ORACLE_ADDRESS")
        self.private_key = os.getenv("AGENT_PRIVATE_KEY")
        self.hermes_url = os.getenv("PYTH_HERMES_URL", "https://hermes.pyth.network")
        self.btc_feed_id = os.getenv("BTC_PRICE_FEED_ID")
        self.api_url = os.getenv("API_SERVER_URL", "http://localhost:8080")
        
        # Validate configuration
        if not all([self.rpc_url, self.contract_address, self.private_key]):
            raise ValueError("Missing required environment variables")
        
        # Initialize Web3
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        self.account = self.w3.eth.account.from_key(self.private_key)
        
        logger.info(f"Agent initialized with address: {self.account.address}")
        
        # Load contract ABI (simplified for demo)
        self.contract_abi = self._get_contract_abi()
        self.contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(self.contract_address),
            abi=self.contract_abi
        )
        
        # Initialize detector and reasoner
        threshold = float(os.getenv("ANOMALY_THRESHOLD", "2.5"))
        window_size = int(os.getenv("WINDOW_SIZE", "30"))
        self.detector = AnomalyDetector(window_size, threshold)
        self.reasoner = MeTTaReasoner()
        
        # State tracking
        self.last_anomaly_flag_time = 0
        self.anomaly_cooldown = 30  # seconds
        self.is_anomalous = False
        
    def _get_contract_abi(self) -> list:
        """Get contract ABI"""
        # Simplified ABI with only needed functions
        return [
            {
                "inputs": [
                    {"internalType": "bytes32", "name": "assetId", "type": "bytes32"},
                    {"internalType": "string", "name": "reason", "type": "string"}
                ],
                "name": "flagAnomaly",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "bytes32", "name": "assetId", "type": "bytes32"}
                ],
                "name": "clearAnomaly",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "bytes32", "name": "assetId", "type": "bytes32"}
                ],
                "name": "getLatestPrice",
                "outputs": [
                    {"internalType": "int64", "name": "price", "type": "int64"},
                    {"internalType": "uint64", "name": "timestamp", "type": "uint64"},
                    {"internalType": "bool", "name": "isAnomalous", "type": "bool"}
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ]
    
    def fetch_price_from_contract(self) -> Optional[float]:
        """Fetch latest price from smart contract"""
        try:
            asset_id = Web3.solidity_keccak(['string'], ['BTC/USD'])
            price_data = self.contract.functions.getLatestPrice(asset_id).call()
            
            price = price_data[0]  # int64 price
            timestamp = price_data[1]  # uint64 timestamp
            
            # Convert from 1e8 scale to float
            price_float = price / 1e8
            
            logger.info(f"Fetched price from contract: ${price_float:.2f}")
            return price_float
            
        except Exception as e:
            logger.error(f"Error fetching price from contract: {e}")
            return None
    
    def flag_anomaly_on_chain(self, asset_id: bytes, reason: str) -> bool:
        """Send transaction to flag anomaly on-chain"""
        try:
            # Check cooldown
            current_time = time.time()
            if current_time - self.last_anomaly_flag_time < self.anomaly_cooldown:
                logger.info("Cooldown active, skipping duplicate flag")
                return False
            
            logger.info(f"Flagging anomaly on-chain: {reason}")
            
            # Build transaction
            nonce = self.w3.eth.get_transaction_count(self.account.address)
            
            tx = self.contract.functions.flagAnomaly(
                asset_id,
                reason
            ).build_transaction({
                'from': self.account.address,
                'nonce': nonce,
                'gas': 200000,
                'gasPrice': self.w3.eth.gas_price,
            })
            
            # Sign and send
            signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            logger.info(f"Transaction sent: {tx_hash.hex()}")
            
            # Wait for confirmation
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            if receipt['status'] == 1:
                logger.info("✅ Anomaly flagged successfully!")
                self.last_anomaly_flag_time = current_time
                self.is_anomalous = True
                return True
            else:
                logger.error("❌ Transaction failed")
                return False
                
        except Exception as e:
            logger.error(f"Error flagging anomaly: {e}")
            return False
    
    def clear_anomaly_on_chain(self, asset_id: bytes) -> bool:
        """Clear anomaly flag on-chain"""
        try:
            if not self.is_anomalous:
                return False
                
            logger.info("Clearing anomaly flag on-chain")
            
            nonce = self.w3.eth.get_transaction_count(self.account.address)
            
            tx = self.contract.functions.clearAnomaly(
                asset_id
            ).build_transaction({
                'from': self.account.address,
                'nonce': nonce,
                'gas': 100000,
                'gasPrice': self.w3.eth.gas_price,
            })
            
            signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            if receipt['status'] == 1:
                logger.info("✅ Anomaly cleared successfully!")
                self.is_anomalous = False
                return True
            else:
                return False
                
        except Exception as e:
            logger.error(f"Error clearing anomaly: {e}")
            return False
    
    def update_api_server(self, price: float, z_score: Optional[float], 
                         is_anomalous: bool, reason: str) -> None:
        """Send update to API server for frontend"""
        try:
            data = {
                "status": "running",
                "price": price,
                "z_score": z_score,
                "is_anomalous": is_anomalous,
                "reason": reason
            }
            response = requests.post(f"{self.api_url}/api/update", json=data, timeout=2)
            if response.status_code == 200:
                logger.debug("API server updated")
        except Exception as e:
            logger.debug(f"Could not update API server: {e}")
    
    def run(self, check_interval: int = 5):
        """Main agent loop"""
        logger.info("🤖 Sentinel AI Agent started!")
        logger.info(f"📊 Monitoring BTC/USD with {check_interval}s interval")
        logger.info(f"🎯 Anomaly threshold: {self.detector.threshold}σ")
        logger.info(f"📈 Window size: {self.detector.window_size} samples\n")
        
        asset_id = Web3.solidity_keccak(['string'], ['BTC/USD'])
        
        iteration = 0
        
        while True:
            try:
                iteration += 1
                logger.info(f"\n{'='*60}")
                logger.info(f"Iteration {iteration} - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                logger.info(f"{'='*60}")
                
                # Fetch current price
                price = self.fetch_price_from_contract()
                
                if price is None:
                    logger.warning("⚠️  Could not fetch price, skipping iteration")
                    time.sleep(check_interval)
                    continue
                
                # Add to history
                self.detector.add_price(price)
                
                # Check for anomaly
                is_anomalous, z_score, reason = self.detector.is_anomaly(price)
                
                logger.info(f"💰 Current Price: ${price:.2f}")
                logger.info(f"📊 Status: {reason}")
                
                if z_score is not None:
                    logger.info(f"📈 History: {len(self.detector.price_history)} samples")
                    logger.info(f"📉 Mean: ${np.mean(self.detector.price_history):.2f}")
                    logger.info(f"📊 Std Dev: ${np.std(self.detector.price_history):.2f}")
                
                # Update API server for frontend
                self.update_api_server(price, z_score, is_anomalous, reason)
                
                # Handle anomaly detection
                if is_anomalous:
                    logger.warning(f"🚨 ANOMALY DETECTED: {reason}")
                    
                    # Generate MeTTa explanation
                    mean_price = np.mean(self.detector.price_history)
                    explanation = self.reasoner.reason_about_anomaly(
                        z_score, price, mean_price
                    )
                    
                    logger.info(f"\n{explanation}\n")
                    
                    # Flag on-chain
                    self.flag_anomaly_on_chain(asset_id, reason)
                    
                elif self.is_anomalous and z_score is not None and abs(z_score) < 1.5:
                    # Price has normalized, clear anomaly
                    logger.info("✅ Price normalized, clearing anomaly flag")
                    self.clear_anomaly_on_chain(asset_id)
                
                else:
                    logger.info("✅ Price is normal")
                
                # Sleep until next check
                time.sleep(check_interval)
                
            except KeyboardInterrupt:
                logger.info("\n\n👋 Agent shutting down gracefully...")
                break
            except Exception as e:
                logger.error(f"Error in main loop: {e}", exc_info=True)
                time.sleep(check_interval)


def main():
    """Entry point"""
    try:
        agent = SentinelAgent()
        check_interval = int(os.getenv("CHECK_INTERVAL", "5"))
        agent.run(check_interval)
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())

