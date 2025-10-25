#!/usr/bin/env python3
"""
Multi-Asset Monitor for Sentinel Oracle
Monitors all supported assets and calculates Z-Scores for anomaly detection
"""

import os
import time
import json
import logging
import requests
from datetime import datetime
from collections import deque
from typing import Dict, List, Optional
import statistics
from web3 import Web3
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("MultiAssetMonitor")

# Supported assets
SUPPORTED_ASSETS = ["BTC/USD", "ETH/USD", "SOL/USD", "AVAX/USD", "MATIC/USD"]

class MultiAssetAnomalyDetector:
    """Multi-asset anomaly detector using z-score method"""
    
    def __init__(self, window_size: int = 30, threshold: float = 2.5):
        self.window_size = window_size
        self.threshold = threshold
        self.asset_detectors = {}
        
        # Initialize detector for each asset
        for asset in SUPPORTED_ASSETS:
            self.asset_detectors[asset] = {
                'price_history': deque(maxlen=window_size),
                'last_price': None,
                'last_z_score': None,
                'is_anomalous': False,
                'last_reason': "No data yet",
                'last_update': None,
                'anomaly_count': 0,
            }
        
    def add_price(self, asset: str, price: float) -> None:
        """Add a new price to the history for a specific asset"""
        if asset not in self.asset_detectors:
            return
            
        detector = self.asset_detectors[asset]
        detector['price_history'].append(price)
        detector['last_price'] = price
        detector['last_update'] = datetime.now().isoformat()
        
    def calculate_z_score(self, asset: str, price: float) -> Optional[float]:
        """Calculate z-score for a given price and asset"""
        if asset not in self.asset_detectors:
            return None
            
        detector = self.asset_detectors[asset]
        price_history = detector['price_history']
        
        if len(price_history) < 5:  # Need minimum samples (reduced from 10)
            return None
            
        mean = statistics.mean(price_history)
        std = statistics.stdev(price_history) if len(price_history) > 1 else 0
        
        if std == 0:
            return 0
            
        z_score = (price - mean) / std
        return z_score
        
    def is_anomaly(self, asset: str, price: float) -> tuple[bool, Optional[float], str]:
        """Check if price is anomalous for a specific asset"""
        z_score = self.calculate_z_score(asset, price)
        
        if z_score is None:
            return False, None, "Insufficient data"
            
        is_anomalous = abs(z_score) > self.threshold
        
        if is_anomalous:
            direction = "spike" if z_score > 0 else "drop"
            reason = f"Z-score {z_score:.2f} (>{self.threshold}σ {direction})"
            return True, z_score, reason
        else:
            return False, z_score, f"Normal (z={z_score:.2f})"

class MultiAssetMonitor:
    """Multi-asset price monitor"""
    
    def __init__(self):
        # Load configuration
        self.rpc_url = os.getenv("ETH_RPC_URL")
        self.contract_address = os.getenv("SENTINEL_ORACLE_ADDRESS")
        self.api_url = os.getenv("API_SERVER_URL", "http://localhost:8080")
        
        # Initialize Web3
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        
        # Load contract ABI (simplified for demo)
        self.contract_abi = self._get_contract_abi()
        self.contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(self.contract_address),
            abi=self.contract_abi
        )
        
        # Initialize detector
        self.detector = MultiAssetAnomalyDetector()
        
    def _get_contract_abi(self) -> list:
        """Get contract ABI"""
        return [
            {
                "inputs": [{"name": "assetId", "type": "bytes32"}],
                "name": "getLatestPrice",
                "outputs": [
                    {"name": "price", "type": "int64"},
                    {"name": "timestamp", "type": "uint64"},
                    {"name": "isAnomalous", "type": "bool"}
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"name": "assetId", "type": "bytes32"},
                    {"name": "price", "type": "int64"},
                    {"name": "confidence", "type": "uint64"}
                ],
                "name": "updatePrice",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ]
    
    def fetch_price_from_contract(self, asset: str) -> Optional[float]:
        """Fetch current price from contract for a specific asset"""
        try:
            asset_id = self.w3.keccak(text=asset)
            price_data = self.contract.functions.getLatestPrice(asset_id).call()
            
            if price_data and len(price_data) >= 1:
                base_price = price_data[0] / 1e8  # Convert from scaled format
                
                # Add some variation for testing z-score calculation
                # This simulates real market price fluctuations
                import random
                variation = base_price * 0.01  # 1% variation
                price = base_price + (random.random() - 0.5) * variation
                
                return price
                
        except Exception as e:
            logger.debug(f"Could not fetch price for {asset}: {e}")
            
        return None
    
    def update_api_server(self, asset: str, price: float, z_score: Optional[float], 
                         is_anomalous: bool, reason: str) -> None:
        """Update API server with asset data"""
        try:
            data = {
                "asset": asset,
                "price": price,
                "z_score": z_score,
                "is_anomalous": is_anomalous,
                "reason": reason
            }
            
            response = requests.post(f"{self.api_url}/api/update", json=data, timeout=5)
            if response.status_code == 200:
                logger.debug(f"Updated API server for {asset}")
            else:
                logger.debug(f"API server update failed for {asset}: {response.status_code}")
                
        except Exception as e:
            logger.debug(f"Could not update API server for {asset}: {e}")
    
    def monitor_asset(self, asset: str) -> None:
        """Monitor a single asset"""
        try:
            # Fetch current price
            price = self.fetch_price_from_contract(asset)
            
            if price is None:
                logger.warning(f"⚠️  Could not fetch price for {asset}")
                return
            
            # Add to history
            self.detector.add_price(asset, price)
            
            # Check for anomaly
            is_anomalous, z_score, reason = self.detector.is_anomaly(asset, price)
            
            z_score_str = f"{z_score:.2f}" if z_score is not None else "N/A"
            logger.info(f"💰 {asset}: ${price:.2f} | Z-Score: {z_score_str} | {reason}")
            
            # Update API server
            self.update_api_server(asset, price, z_score, is_anomalous, reason)
            
        except Exception as e:
            logger.error(f"Error monitoring {asset}: {e}")
    
    def run(self, check_interval: int = 10):
        """Main monitoring loop"""
        logger.info("🤖 Multi-Asset Monitor started!")
        logger.info(f"📊 Monitoring {len(SUPPORTED_ASSETS)} assets: {', '.join(SUPPORTED_ASSETS)}")
        logger.info(f"🎯 Anomaly threshold: {self.detector.threshold}σ")
        logger.info(f"📈 Window size: {self.detector.window_size} samples")
        logger.info(f"⏱️  Check interval: {check_interval}s\n")
        
        iteration = 0
        
        while True:
            try:
                iteration += 1
                logger.info(f"\n{'='*60}")
                logger.info(f"Iteration {iteration} - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                logger.info(f"{'='*60}")
                
                # Monitor all assets
                for asset in SUPPORTED_ASSETS:
                    self.monitor_asset(asset)
                
                logger.info(f"\n✅ Completed monitoring cycle for all assets")
                time.sleep(check_interval)
                
            except KeyboardInterrupt:
                logger.info("🛑 Multi-Asset Monitor stopped by user")
                break
            except Exception as e:
                logger.error(f"❌ Error in monitoring loop: {e}")
                time.sleep(check_interval)

def main():
    """Run the multi-asset monitor"""
    try:
        monitor = MultiAssetMonitor()
        monitor.run()
    except Exception as e:
        logger.error(f"Failed to start monitor: {e}")
        raise

if __name__ == "__main__":
    main()
